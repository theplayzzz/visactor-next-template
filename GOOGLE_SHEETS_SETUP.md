# Google Sheets Integration Setup

## Resumo

✅ **O arquivo JSON já está protegido** - está no `.gitignore`
✅ **Você pode deletar o arquivo JSON** - a aplicação tem fallback para variáveis de ambiente
✅ **Configuração flexível** - funciona localmente E em produção

## Como Funciona

A aplicação verifica na seguinte ordem:

1. **Se o arquivo JSON existe** → usa ele (desenvolvimento local)
2. **Se não existe** → usa variáveis de ambiente do `.env.local` (produção)

## Opção 1: Arquivo JSON (Recomendado para Local)

**Vantagens:**
- Mais fácil de configurar localmente
- Não precisa formatar a private key manualmente

**Passos:**
1. Baixe o arquivo JSON do Google Cloud Console
2. Salve como: `gen-lang-client-0312769039-f45a7c9ff94b.json` na raiz do projeto
3. O arquivo já está no `.gitignore`, não será commitado

## Opção 2: Variáveis de Ambiente (Recomendado para Produção)

**Vantagens:**
- Mais seguro para deploy (Vercel, Netlify, etc)
- Não depende de arquivos locais

**Passos:**

1. Abra o arquivo JSON de credenciais
2. Copie os valores para o `.env.local`:

```env
GOOGLE_CLIENT_EMAIL="planilhas@gen-lang-client-0312769039.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSua chave aqui...\n-----END PRIVATE KEY-----"
GOOGLE_SHEET_ID="15J4WLZ6T84LGlhLOJxQUKr9lBn9GFX8FMeK8LRSwmgM"
```

**⚠️ Importante:** A `GOOGLE_PRIVATE_KEY` deve ter `\n` literal (não quebras de linha reais)

## Posso Deletar o Arquivo JSON?

**Sim!** Desde que você tenha configurado as variáveis de ambiente no `.env.local`

**Como testar:**

1. Delete o arquivo JSON
2. Certifique-se que o `.env.local` tem as 3 variáveis
3. Reinicie o servidor: `pnpm dev`
4. Acesse: http://localhost:3000/test-sheets

Se aparecer dados, está funcionando! ✅

## Deploy em Produção

Ao fazer deploy (Vercel, Netlify, etc):

1. **NÃO** faça commit do arquivo JSON
2. Configure as variáveis de ambiente no painel da plataforma:
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_SHEET_ID`

## Troubleshooting

### Erro: "Unable to parse range"
- Verifique se o nome da planilha está correto em `getSheetData()`

### Erro: "API has not been used"
- Habilite a Google Sheets API no Google Cloud Console

### Erro: "Permission denied"
- Compartilhe a planilha com o email da Service Account
- Dê permissão de "Visualizador"
