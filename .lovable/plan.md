

# Página de Cancelados + Fluxo Cancelar/Restaurar

## Problema
Atualmente os context menus de Pacotes e Part Numbers só têm "Editar" e "Excluir". Falta a opção "Cancelar" e uma página dedicada para itens cancelados com possibilidade de restauração.

## Abordagem: Estado Global Compartilhado

Como os dados são locais (useState), precisamos de um estado compartilhado entre as 3 páginas. Usaremos um **React Context** para gerenciar as listas de pacotes cancelados e PNs cancelados, com data de cancelamento.

## Mudanças

### 1. Criar Context de Cancelamento (`src/contexts/CancelledContext.tsx`)
- Context com arrays `cancelledPackages` e `cancelledPartNumbers`
- Cada item cancelado terá o objeto original + `cancelledDate: string`
- Funções: `cancelPackage(pkg)`, `cancelPartNumber(pn)`, `restorePackage(id)`, `restorePartNumber(id)`
- Provider no App.tsx

### 2. Nova Página de Cancelados (`src/pages/CancelledPage.tsx`)
- Duas abas (Tabs): "Pacotes Cancelados" e "Part Numbers Cancelados"
- Cada aba reutiliza as mesmas colunas das tabelas originais + coluna extra "Data Cancelamento"
- Visual esmaecido: `opacity-60` nas linhas da tabela
- Context menu com botão direito → "Restaurar"
- Ao restaurar, item volta para a lista principal da página original

### 3. Atualizar PackagesPage.tsx
- Importar o context
- Adicionar "🚫 Cancelar" no context menu (entre Editar e Excluir)
- Ao cancelar: remove da lista local + adiciona no context de cancelados
- Ao restaurar (via context): item reaparece na lista

### 4. Atualizar PartNumbersPage.tsx
- Mesma lógica: adicionar "Cancelar" no context menu
- Integração com o context

### 5. Rota e Sidebar
- Nova rota `/cancelados` no App.tsx
- Novo item no sidebar com ícone `Ban` do lucide-react

### 6. Atualizar App.tsx
- Envolver rotas com `CancelledProvider`
- Adicionar rota `/cancelados`

## Tipos adicionais
```typescript
interface CancelledPackage extends Package { cancelledDate: string }
interface CancelledPartNumber extends PartNumber { cancelledDate: string }
```

