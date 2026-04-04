

# Coluna "Status Previsão" na Tabela de Pacotes

## Resumo
Adicionar coluna calculada "Status Previsão" entre "Sem. Total" e "Sem. Previsão" na tabela de Pacotes, com badges coloridas baseadas nas semanas de previsão:
- **Achieving Target** (verde) — previsão ≤ 24 semanas
- **Approaching Target** (amarelo) — entre 24 e 26 semanas
- **Over Target** (vermelho) — acima de 26 semanas

## Mudanças

### `src/pages/PackagesPage.tsx`
1. Adicionar header "Status Previsão" no array de colunas, entre "Sem. Total" e "Sem. Previsão"
2. Criar função helper `predictionStatusBadge(pkg)` que calcula `calculatePredictionWeeks` e retorna badge com cor e texto adequados
3. Inserir `<td>` com o badge na linha da tabela, na posição correspondente
4. Incluir a coluna na exportação Excel/PDF

### Detalhes técnicos
- Reutiliza `calculatePredictionWeeks` já importado
- Mesma lógica de faixas usada no gráfico Prediction Target do dashboard (≤24 / 24–26 / >26)
- Cores: verde `#10B981`, amarelo `#F59E0B`, vermelho `#E11D48` — consistentes com o gráfico

