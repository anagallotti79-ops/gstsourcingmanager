

# Correção do Gráfico "Previsão de Fechamento por Mês"

## Problema
Datas no primeiro dia do mês (ex: `2025-03-01`, `2025-06-01`) são interpretadas como UTC pelo JavaScript. Em fusos horários negativos como o Brasil (UTC-3), `new Date("2025-03-01")` vira 28/fev às 21h, fazendo o `getMonth()` retornar o mês anterior. Isso causa pacotes aparecendo no mês errado no gráfico.

**Pacotes afetados**: pkg-2 (jun→mai), pkg-3 (mar→fev), pkg-4 (mai→abr), pkg-6 (ago→jul), pkg-7 (dez→nov) — todos com `recommendationPredictionDate` no dia 01.

## Solução

### `src/pages/ProjectDetailPage.tsx`
Alterar o parsing da data no bloco do Dashboard 5 (linha ~97) para usar split manual em vez de `new Date()`, evitando o problema de timezone:

```typescript
const [year, mon] = date.split("-");
const key = `${year}-${mon}`;
```

Mesma correção no label (linha ~106):
```typescript
const [y, m] = month.split("-");
const label = new Date(Number(y), Number(m) - 1).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
```

E na função de click do gráfico mensal, onde filtra pacotes por mês (se houver parsing similar).

### Escopo
- Apenas o arquivo `ProjectDetailPage.tsx` será alterado
- Dados mock permanecem inalterados
- Datas passadas continuarão aparecendo normalmente (pacotes já fechados)

