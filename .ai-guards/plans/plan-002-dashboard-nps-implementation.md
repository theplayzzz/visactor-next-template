# Plano de Implementação Detalhado - Dashboard NPS

## 📋 Contexto e Objetivo
Implementar uma página completa de dashboard NPS que processe dados do Google Sheets contendo pesquisas de satisfação, calculando métricas de NPS (Net Promoter Score) e apresentando visualizações interativas usando VChart.

### Dados Disponíveis
- **Total de registros**: 637 linhas na planilha
- **Campos principais**:
  - `Lead ID`: Identificador único
  - `Lead Name`: Nome do cliente
  - `R1 NPS Atendimento`: Avaliação do atendimento (⭐ 0-5)
  - `R2 NPS Estabilidade`: Avaliação da estabilidade (⭐ 0-5)
  - `OBS final`: Comentário qualitativo
  - `Telefone`: Contato do cliente

## 🏗️ Estrutura de Implementação

### 1. **Configuração de Rota e Navegação**

#### 1.1 Criar estrutura de diretório
```bash
src/app/(nps)/nps/
├── page.tsx        # Página principal do dashboard NPS
└── loading.tsx     # Estado de carregamento
```

#### 1.2 Atualizar navegação no SideNav
**Arquivo**: `src/config/site.tsx`
**Modificação**: Adicionar novo item de navegação
```typescript
import { Star } from "lucide-react"; // Adicionar import

// Adicionar ao array navigations:
{
  icon: Star,
  name: "NPS",
  href: "/nps",
}
```

### 2. **Backend - API Route**

#### 2.1 Criar API Route `/api/nps/route.ts`
**Responsabilidades**:
- Buscar dados do Google Sheets usando `getSheetData()`
- Converter estrelas (⭐) para valores numéricos (0-5)
- Calcular score total (R1 + R2)
- Categorizar respondentes:
  - **Promotores**: Score total 9-10
  - **Neutros**: Score total 7-8
  - **Detratores**: Score total ≤ 6
- Retornar métricas agregadas

#### 2.2 Estrutura de tipos TypeScript
**Arquivo**: `src/types/nps.ts`
```typescript
export interface NPSRawData {
  leadId: string;
  leadName: string;
  r1Stars: string;      // "⭐⭐⭐⭐⭐"
  r2Stars: string;      // "⭐⭐⭐⭐⭐"
  comment: string | null;
  phone: string;
}

export interface NPSProcessedData {
  leadId: string;
  leadName: string;
  r1Score: number;      // 0-5
  r2Score: number;      // 0-5
  totalScore: number;   // 0-10
  category: 'promoter' | 'neutral' | 'detractor';
  comment: string | null;
  hasComment: boolean;
}

export interface NPSMetrics {
  scoreNPS: number;           // -100 a +100
  totalSurveys: number;       // 637
  totalResponses: number;     // Linhas com estrelas
  responseRate: number;       // % respondentes
  promoters: number;
  neutrals: number;
  detractors: number;
  promotersPercentage: number;
  neutralsPercentage: number;
  detractorsPercentage: number;
  r1Average: number;          // Média R1
  r2Average: number;          // Média R2
  commentsCount: number;
}

export interface NPSApiResponse {
  metrics: NPSMetrics;
  distribution: Array<{
    type: string;
    value: number;
    percentage: number;
  }>;
  comparison: Array<{
    dimension: string;
    average: number;
    total: number;
  }>;
  recentComments: NPSProcessedData[];
}
```

#### 2.3 Função de conversão de estrelas
```typescript
function countStars(starString: string): number {
  if (!starString) return 0;
  // Conta caracteres de estrela (⭐)
  return (starString.match(/⭐/g) || []).length;
}
```

### 3. **Frontend - Componentes**

#### 3.1 Página Principal `/app/(nps)/nps/page.tsx`
**Estrutura**:
```typescript
export default async function NPSPage() {
  // Server Component - busca dados
  const data = await fetch('/api/nps');

  return (
    <Container>
      <NPSMetrics metrics={data.metrics} />
      <div className="grid grid-cols-1 laptop:grid-cols-2 gap-6">
        <NPSGaugeChart distribution={data.distribution} />
        <NPSComparisonChart comparison={data.comparison} />
      </div>
      <NPSProgressBars distribution={data.distribution} />
      <NPSCommentsTable comments={data.recentComments} />
    </Container>
  );
}
```

#### 3.2 Componentes de Métricas (Cards)
**Arquivo**: `src/components/chart-blocks/components/nps-metrics/index.tsx`

**Estrutura de Cards**:
1. **Score NPS**
   - Valor: -100 a +100
   - Cor condicional: Verde (+50), Amarelo (0-49), Vermelho (< 0)
   - Ícone: TrendingUp/TrendingDown

2. **Taxa de Resposta**
   - Formato: XX.X%
   - Ícone: Users

3. **Total de Pesquisas**
   - Valor: 637
   - Ícone: Send

4. **Total de Respostas**
   - Valor: Contagem com estrelas
   - Ícone: MessageSquare

**Reutilizar**: Padrão do `MetricCard` existente com adaptações

### 4. **Gráficos VChart**

#### 4.1 Gráfico de Distribuição NPS (Gauge/Semicircle Pie)
**Arquivo**: `src/components/chart-blocks/charts/nps-gauge/chart.tsx`

**Especificações VChart** (baseado na documentação):
```typescript
const spec: IPieChartSpec = {
  type: 'pie',
  data: [{
    id: 'distribution',
    values: distribution // [{type: 'Promotores', value: X}, ...]
  }],
  valueField: 'value',
  categoryField: 'type',
  outerRadius: 0.8,
  innerRadius: 0.6,
  startAngle: -180,
  endAngle: 0,
  centerY: '100%',
  pie: {
    style: {
      cornerRadius: 6,
      fill: (datum) => {
        // Cores customizadas por categoria
        if (datum.type.includes('Promotor')) return '#5fb67a';
        if (datum.type.includes('Neutro')) return '#f5c36e';
        return '#da6d67';
      }
    }
  },
  indicator: [
    {
      visible: true,
      offsetY: '40%',
      title: {
        style: {
          text: 'Score NPS',
          fontSize: 16,
          opacity: 0.6
        }
      }
    },
    {
      visible: true,
      offsetY: '64%',
      title: {
        style: {
          text: scoreNPS.toString(),
          fontSize: 28,
          fill: getScoreColor(scoreNPS)
        }
      }
    }
  ],
  legends: {
    visible: true,
    orient: 'bottom',
    position: 'center'
  },
  tooltip: {
    mark: {
      content: [
        {
          key: (datum) => datum?.type,
          value: (datum) => `${datum?.value} (${datum?.percentage}%)`
        }
      ]
    }
  }
};
```

#### 4.2 Gráfico Comparativo R1 vs R2 (Bar Chart)
**Arquivo**: `src/components/chart-blocks/charts/nps-comparison/chart.tsx`

**Especificações VChart**:
```typescript
const spec: IBarChartSpec = {
  type: 'bar',
  data: [{
    id: 'comparison',
    values: [
      { dimension: 'Atendimento (R1)', average: r1Avg, max: 5 },
      { dimension: 'Estabilidade (R2)', average: r2Avg, max: 5 }
    ]
  }],
  xField: 'dimension',
  yField: 'average',
  seriesField: 'dimension',
  bar: {
    style: {
      cornerRadius: [4, 4, 0, 0],
      fill: (datum) => {
        if (datum.dimension.includes('R1')) return '#4D96FF';
        return '#6BCB77';
      }
    }
  },
  axes: [
    {
      orient: 'left',
      type: 'linear',
      min: 0,
      max: 5,
      title: {
        visible: true,
        text: 'Média de Estrelas'
      }
    },
    {
      orient: 'bottom',
      type: 'band'
    }
  ],
  tooltip: {
    mark: {
      content: [
        {
          key: 'Média',
          value: (datum) => datum?.average.toFixed(2) + ' ⭐'
        }
      ]
    }
  },
  animationAppear: {
    duration: 1000,
    easing: 'cubicInOut'
  }
};
```

#### 4.3 Progress Bars de Distribuição
**Arquivo**: `src/components/chart-blocks/components/nps-progress/index.tsx`

**Reutilizar**: `LinearProgress` de `customer-satisfication`
**Adaptações**:
- Cores específicas NPS (verde, amarelo, vermelho)
- Ícones: ThumbsUp (Promotor), Minus (Neutro), ThumbsDown (Detrator)
- Mostrar percentual e valor absoluto

### 5. **Seção de Comentários**

#### 5.1 Tabela de Comentários
**Arquivo**: `src/components/chart-blocks/components/nps-comments-table/index.tsx`

**Funcionalidades**:
1. **Colunas**:
   - Nome do Lead
   - Score Total (com badge colorido)
   - Categoria (Promotor/Neutro/Detrator)
   - Comentário (truncado com "ver mais")

2. **Filtros**:
   - Por categoria (dropdown)
   - Busca por texto (input)
   - Apenas com comentários (checkbox)

3. **Estados**:
   - Paginação (10 itens por página)
   - Ordenação por score/nome
   - Loading state

**Componentes UI**:
- Reutilizar `Table` de `@/components/ui/table`
- `Badge` para categorias
- `Input` para busca
- `Select` para filtros

### 6. **Sincronização com Tema**

#### 6.1 Integração com ChartThemeProvider
Todos os gráficos devem:
```typescript
"use client";
import { useChartTheme } from "@/components/providers/chart-theme-provider";
import { useHydration } from "@/hooks/use-hydration";

export default function Chart({ data }) {
  const theme = useChartTheme();
  const isHydrated = useHydration();

  if (!isHydrated) return null;

  return <VChart spec={spec} theme={theme} />;
}
```

#### 6.2 Cores do tema
Adaptar cores para dark mode:
- Usar variáveis CSS (`var(--chart-1)`, etc.)
- Garantir contraste adequado
- Manter consistência visual

### 7. **Performance e Otimizações**

#### 7.1 Cache de dados
- Implementar cache de 5 minutos na API route
- Usar `unstable_cache` do Next.js

#### 7.2 Loading States
- Skeleton loaders para cards
- Shimmer effect para gráficos
- Suspense boundaries

#### 7.3 Error Handling
- Try-catch em todas as chamadas API
- Fallback UI para erros
- Mensagens de erro amigáveis

### 8. **Responsividade**

#### 8.1 Breakpoints
- **Mobile** (`<640px`): Stack vertical, gráficos full width
- **Tablet** (`640-1024px`): 2 colunas para cards
- **Desktop** (`>1024px`): Layout completo 4 colunas

#### 8.2 Adaptações móveis
- Gráficos menores com menos detalhes
- Tabela com scroll horizontal
- Filtros em dropdown collapsible

## 📝 Observações Importantes da Documentação VChart

### Animações
- Usar `animationAppear` com `easing: 'cubicInOut'` para entrada suave
- Duration recomendado: 1000ms para gráficos principais
- Registrar morphing apenas se necessário transições entre tipos

### Tooltips
- Sempre incluir `trigger: ['click', 'hover']` para acessibilidade
- Formatar valores com `addThousandsSeparator()` utility
- Personalizar conteúdo com funções para dados dinâmicos

### Indicadores (Gauge)
- Usar `indicator` para mostrar valor central no gráfico semicircular
- `offsetY` em percentual para posicionamento vertical
- Múltiplos indicadores para título e valor

### Legendas
- `orient: 'bottom'` para gráficos semicirculares
- `position: 'center'` para centralizar horizontalmente
- Desabilitar seleção se não necessário: `select: false`

## 🚀 Sequência de Implementação

1. **Fase 1 - Estrutura Base** (30 min)
   - Criar diretórios e arquivos base
   - Configurar rota e navegação
   - Criar tipos TypeScript

2. **Fase 2 - Backend** (45 min)
   - Implementar API route
   - Processar dados do Sheets
   - Calcular métricas NPS

3. **Fase 3 - Componentes de Métricas** (30 min)
   - Cards superiores
   - Integração com dados da API

4. **Fase 4 - Gráficos Principais** (1h)
   - Gauge chart de distribuição
   - Bar chart comparativo
   - Progress bars

5. **Fase 5 - Tabela de Comentários** (45 min)
   - Componente de tabela
   - Filtros e busca
   - Paginação

6. **Fase 6 - Polimento** (30 min)
   - Ajustes de responsividade
   - Dark mode
   - Loading states
   - Testes manuais

## ✅ Checklist de Validação

- [ ] Score NPS calculado corretamente (-100 a +100)
- [ ] Categorização precisa (9-10, 7-8, 0-6)
- [ ] Conversão de estrelas para números funcionando
- [ ] Gráficos renderizando com animações
- [ ] Tema sincronizado (light/dark)
- [ ] Responsivo em todos os breakpoints
- [ ] Filtros de comentários funcionais
- [ ] Performance adequada (< 2s load)
- [ ] Sem erros no console
- [ ] Acessibilidade básica (tooltips, labels)

## 🔧 Recursos do Projeto Utilizados

- **Componentes UI**: `/components/ui/` (Table, Badge, Input, Select)
- **Container**: Layout wrapper padrão
- **ChartTitle**: Componente de título reutilizável
- **MetricCard**: Padrão de cards de métricas
- **LinearProgress**: Barras de progresso do customer-satisfaction
- **Utilities**: `addThousandsSeparator()`, `cn()`
- **Hooks**: `useHydration()`, `useChartTheme()`
- **Providers**: ChartThemeProvider, ModeThemeProvider
- **Google Sheets**: Lib já configurada com autenticação

## 🎯 Resultado Esperado

Dashboard NPS completo e funcional exibindo:
- Score NPS em destaque com indicador visual
- Distribuição clara de Promotores/Neutros/Detratores
- Comparação visual entre dimensões R1 e R2
- Lista filtrada de comentários dos respondentes
- Métricas de engajamento (taxa de resposta, totais)
- Interface responsiva e compatível com dark mode
- Animações suaves e interações intuitivas