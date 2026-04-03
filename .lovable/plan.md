

# Modal de Detalhes ao Clicar nos Gráficos do Dashboard

## Resumo
Ao clicar em qualquer segmento/barra dos 5 gráficos do dashboard do projeto, abrir um Dialog (modal) mostrando a lista filtrada dos pacotes ou part numbers correspondentes.

## Mudanças

### 1. Adicionar estado para o modal (`ProjectDetailPage.tsx`)
- State `modalData`: `{ title: string, type: 'packages' | 'pns', items: Package[] | PartNumber[] } | null`
- Quando `modalData` não é null, renderizar um `Dialog` com a tabela dos itens filtrados

### 2. Handlers de clique por gráfico
- **Gráfico 1 (DM Division)**: `onClick` na `Bar` filtra pacotes por `dmDivision` clicado
- **Gráfico 2 (Prediction Target)**: `onClick` na `Pie/Cell` filtra pacotes pela faixa de semanas (<=24, 24-26, >26)
- **Gráfico 3 (Current Phase Target)**: `onClick` na `Bar` empilhada filtra pacotes por `status` (fase) + `phaseTargetStatus` (On Track/At Risk/Late)
- **Gráfico 4 (Status PO)**: `onClick` na `Pie/Cell` filtra part numbers por `statusPO`
- **Gráfico 5 (Previsão Mensal)**: `onClick` no ponto/área filtra pacotes pelo mês correspondente da `recommendationPredictionDate`

### 3. Componente do Modal
- Usar `Dialog` do shadcn/ui existente
- Título dinâmico (ex: "Pacotes - DMCA", "Part Numbers - Com PO")
- Tabela compacta com as colunas principais (mesmas já usadas nas abas Pacotes/PNs)
- Botão de fechar

### Arquivos afetados
- `src/pages/ProjectDetailPage.tsx` — adicionar estado, handlers de clique nos gráficos, e Dialog com tabela filtrada

