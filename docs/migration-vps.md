# AdaptLink — operação na VPS Growon

## Topologia e corte

- Código: imagem Docker construída em `/opt/adaptlink/app`, uma instância Next.js com limite de 640 MiB e 1 CPU. Traefik e rede `dokploy-network` já existem na VPS.
- Segredos: `/opt/adaptlink/.env` (permissão 600), nunca na imagem ou no Git. O backup WSL contém as credenciais Google, Kommo e Neon; o token Meta vem do cofre DPAPI local. Rotacionar o token Meta exposto em conversa anterior após o corte.
- Banco: Neon atual; não mover nem recriar o banco neste corte. `next build` não executa `drizzle-kit push`.
- Meta: Graph API, `act_836108730063442`, insights por anúncio/dia. Backfill a partir de 2026-05-30 (fim da sincronização Airbyte) e atualização diária dos últimos 28 dias, para absorver atribuição tardia. A chave sintética `meta-graph:<conta>:<ad>:<data>` torna a coleta repetível sem duplicar linhas.
- Decisão de fonte: **não usar Airbyte para novas coletas Meta**. O timer da VPS consulta a Graph API diretamente e persiste os resultados no Neon. As colunas `_airbyte_*` de `ads_insights` são apenas compatibilidade com o esquema preexistente; não representam uma conexão ativa. Preservar os registros históricos anteriores a 30/05/2026 para não apagar relatórios antigos. Uma substituição desse histórico por dados reextraídos da Graph API requer backfill e reconciliação próprios, antes de qualquer exclusão.
- Google Ads: leitura BigQuery existente; Google Sheets: leitura da planilha existente; Kommo: API e persistência Neon existentes. A mudança de hospedagem não altera esses fornecedores.
- DNS: manter CNAME Vercel até a VPS passar testes. Depois substituir **apenas** `adapt.link.grupogrowon.com.br` por A `178.156.151.53` na Cloudflare, TTL 300, preferencialmente somente DNS no primeiro teste. Validar HTTPS e páginas; não remover a Vercel antes disso.

## Como cada conector opera

| Conector | Execução na VPS | Dados que alimenta | Limite atual |
| --- | --- | --- | --- |
| Meta Graph API | Timer diário 07:30 UTC; refaz últimos 28 dias em lotes de 14 | `ads_insights` no Neon: gasto, impressões, cliques, ações, conversas e rankings por anúncio/dia; investimento Meta do comercial | `lead` da Meta difere de conversa/lead Kommo; alcance de período não é único |
| Google Ads → BigQuery DTS | Consulta sob demanda na página, sem coletor novo | Aba Google de campanhas e investimento Google do comercial | Depende da atualização do dataset DTS e de suas ações de conversão configuradas |
| Kommo leads/status/usuários | Timer diário 06:00 UTC | Tabelas Kommo no Neon e indicadores da aba comercial | Origem baseada em tags; “Outbound” agrega origem desconhecida |
| Kommo eventos | Timer diário 18:00 UTC; retoma por página na primeira carga | Histórico `kommo_lead_events` para auditoria/evolução de MQL | A tela atual ainda usa status presente para MQL, não eventos históricos |
| Google Sheets | Consulta sob demanda por endpoints existentes | NPS/planilha vinculada | Sem coleta diária nova; depende do acesso da conta de serviço |

O Next.js e os coletores compartilham **um** container, em vez de manter um worker ocioso. Os timers `systemd` apenas iniciam processos curtos no container; as credenciais ficam fora da imagem.

## Sequência de validação

1. `docker compose config --quiet`, build e subida; `docker inspect` deve indicar healthy. Testar `https://adaptlink.178-156-151-53.sslip.io/api/health` e páginas `/campanhas` e `/comercial` antes do DNS.
2. Executar Meta `--dry-run --since=2026-09-21 --until=2026-09-21`; comparar quantidade, gasto, cliques, impressões e ações com resposta da Graph API. Depois executar backfill e conferir máximos `date_start`/`_airbyte_extracted_at` e ausência de duplicatas para o mesmo anúncio/dia.
3. Confrontar Google Ads/BigQuery, Kommo e Google Sheets entre Vercel e VPS no mesmo intervalo. Para o comercial, verificar volume de leads, status, ganhos e MQL/atribuição; os indicadores derivados de mapeamentos incompletos não devem ser interpretados como verdade da origem.
4. Ativar timers diários: Meta 07:30 UTC, Kommo leads 06:00 UTC, Kommo eventos 18:00 UTC. Verificar saída no journal e `sync_logs`. Desligar agendamentos Vercel antes de ativar os equivalentes da VPS.
5. Trocar DNS e testar pelo domínio público, certificado, ausência de erro 5xx e números nas duas abas. Preservar Vercel por 24–48 h para retorno rápido; depois desvincular domínio e desativar o projeto antigo.

## Limites semânticos dos indicadores

- Na Meta, `lead` é o evento de lead reportado pela plataforma, **não** o número de conversas WhatsApp nem o número de oportunidades no Kommo. Conversas iniciadas aparecem separadamente.
- Alcance somado de linhas anúncio/dia não é alcance único de um período; frequência calculada com essa soma é estimativa. Para alcance único exato de intervalo arbitrário, consultar a Graph API no nível/período solicitado ou armazenar snapshots agregados por período.
- As métricas de retorno comercial dependem da qualidade do vínculo entre lead/CRM e origem de campanha. Esta migração recupera disponibilidade da mídia Meta; não resolve por si só atribuição incompleta, definição de MQL ou eventos de CRM ausentes.
- Hoje, a origem comercial é inferida por tags do Kommo (`meta`/`facebook`/`instagram` ou `google`). **Qualquer lead sem essas tags cai em “Outbound”**, inclusive indicação ou origem desconhecida; este rótulo não prova prospecção ativa. É necessário padronizar UTMs/campos de origem no CRM e separar “sem origem”.
- MQL é calculado pelo **status atual** em uma lista fixa de IDs, não pelo histórico de passagem. Uma venda pode deixar de contar como MQL do mesmo recorte; por isso MQL→Venda pode superar 100%. Para corrigir, usar eventos de status do Kommo com regra e janela temporal acordadas com o comercial.
- O coletor de eventos do Kommo estava limitado a 50 segundos e reiniciava da página 1. Agora retoma de `sync_state.last_page`, tem limite de 10 minutos por rodada e grava até 100 eventos por lote; se houver muito histórico, a primeira sincronização pode terminar como parcial e continuar na execução seguinte.
- O Kommo pode falhar transitoriamente durante uma carga longa: cada chamada tem até quatro tentativas com recuo, e o cursor é salvo a cada 10 páginas para limitar o retrabalho. A carga histórica foi muito maior que a rotina diária; consultar `scripts/audit-kommo-sync.mjs` e `journalctl -u adaptlink-kommo-events.service` até o primeiro `completed`.
- Leads são filtrados pela **data de criação**, vendas/perdas pela **data de fechamento**. Portanto as taxas Lead→Venda de um mesmo intervalo não são conversões de uma coorte única; usar análise de coorte se esse for o objetivo.
- O Google Ads continua com a latência e o escopo do dataset BigQuery/DTS já configurado. Verificar atualização do dataset separadamente dos dados Meta.

## Operação e retorno

- Falhas: `systemctl status adaptlink-meta.timer`, `journalctl -u adaptlink-meta.service -n 100`, `docker logs --tail 100 adaptlink-app`, `docker stats --no-stream adaptlink-app`.
- Reiniciar apenas o serviço: `cd /opt/adaptlink/app && docker compose up -d --no-deps app`.
- Se o corte falhar, restaurar o CNAME anterior `6d5c38311cc4f386.vercel-dns-017.com`, manter o projeto Vercel ativo e investigar sem apagar dados Neon. A coleta Meta é idempotente e pode continuar mesmo se a exibição voltar temporariamente à Vercel.

## Registro do corte em 2026-09-23

- VPS `178.156.151.53`: Docker saudável; `/api/health`, comercial, campanhas Google/Meta, NPS e Google Sheets responderam 200. Uso observado do app: cerca de 190–223 MiB de RAM sob carga leve/sincronismo, dentro de 640 MiB.
- Google Ads (24/08–22/09): Vercel e VPS idênticos — R$ 766,17 de gasto, 88 conversões, 823 cliques e 9.064 impressões. A fonte continua BigQuery DTS.
- Meta (21–22/09): R$ 113,00, 73 cliques, 5.216 impressões e 10 conversas iniciadas. A Graph API devolveu R$ 58,43 em 21/09, igual à página. Backfill 30/05–22/09 gerou 116 linhas, R$ 4.798,65; 0 dias/anúncios sobrepostos ao Airbyte. Reexecução de 21/09 manteve 116 linhas.
- Cloudflare: `adapt.link` alterado de CNAME Vercel para A `178.156.151.53`, somente DNS. HTTPS validado com certificado público e HTTP 200 no domínio definitivo.
- Vercel: crons desativados, integração Git removida e produção pausada. Não excluir ainda: ela é o plano de retorno. O DNS deve voltar ao CNAME anterior e o projeto deve ser retomado para rollback.
- Kommo: a carga histórica de eventos concluiu com `completed` e 102.337 eventos únicos; uma rodada incremental seguinte adicionou mais 1 (102.338) e concluiu em aproximadamente 1 segundo. O serviço de leads concluiu uma rodada incremental com 9 registros. Os três timers Meta/leads/eventos estão ativos na VPS; os serviços foram executados manualmente com saída 0.
- As entradas antigas `partial`/`failed` em `sync_logs` documentam a recuperação da carga inicial e não o estado atual. O cliente local ganhou espera HTTP de 15 minutos; chamadas Kommo agora tentam novamente falhas transitórias e o cursor de eventos é salvo a cada 10 páginas.
- Em 23/09, não havia container ou serviço Airbyte ativo na VPS; o timer `adaptlink-meta.timer` estava ativo, e um teste `--dry-run` de 22/09 retornou 1 linha e R$ 54,57 diretamente da Graph API. A verificação na VPS não confirma, por si, o estado de uma eventual conta Airbyte externa: desativá-la na própria plataforma, se existir, evita novas escritas no Neon.
