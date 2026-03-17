# Padronizar badges de status na ProjectDetailPage

## Problema

Na `ProjectDetailPage`, as tabelas de Pacotes e Part Numbers usam `<Badge>` com classes inline (`bg-success`, `bg-warning`, etc.), enquanto as páginas principais (`PackagesPage` e `PartNumbersPage`) usam `<span>` com ícones (`CheckCircle2`, `AlertTriangle`, `XCircle`, `Clock`) e classes de texto (`text-success`, `text-warning`, `text-destructive`).

## Mudanças

### `src/pages/ProjectDetailPage.tsx`

1. Importar ícones: `CheckCircle2`, `AlertTriangle`, `XCircle`, `Clock` do lucide-react
2. Na aba **Pacotes** (linha ~308-316): substituir o `<Badge>` do `phaseTargetStatus` pelo mesmo padrão `targetBadge` da PackagesPage:
  - On Track → `<span>` verde com `CheckCircle2`
  - At Risk → `<span>` amber com `AlertTriangle`
  - Late → `<span>` vermelho com `XCircle`
3. Na aba **Part Numbers** (linha ~345-353): substituir o `<Badge>` do `statusPO` pelo mesmo padrão `statusPOBadge` da PartNumbersPage:
  - Com PO → `<span>` verde com `CheckCircle2`
  - Pendente → `<span>` amber com `Clock`
  - In Process → `<span>` azul com `Clock`

Mudança simples, apenas 1 arquivo afetado.