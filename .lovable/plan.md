

# Adicionar Part Numbers ao criar Pacote + coluna "Pacote" na aba de Part Numbers

## Problema atual
- As páginas de Pacotes e Part Numbers usam estado local independente (`useState`), sem compartilhamento de dados
- Não existe vínculo entre um Part Number e um Pacote
- Não é possível cadastrar Part Numbers ao criar um Pacote

## Mudanças

### 1. Criar contexto compartilhado de dados (`src/contexts/DataContext.tsx`)
- Mover os estados de `pkgList` e `pnList` para um contexto global
- Expor funções: `addPackage`, `addPartNumber`, `updatePackage`, `updatePartNumber`, `deletePackage`, `deletePartNumber`
- Ambas as páginas consomem este contexto em vez de `useState` local

### 2. Adicionar campo `packageId` ao tipo PartNumber (`src/data/types.ts`)
- Novo campo opcional `packageId?: string` em `PartNumber`
- Permite vincular Part Numbers a um Pacote específico

### 3. Adicionar seção de Part Numbers no formulário de criação de Pacote (`PackagesPage.tsx`)
- Após os campos existentes do `PkgForm`, adicionar seção "Part Numbers"
- Cada PN inline terá campos mínimos: **PN**, **ERA**, **Descrição**, **Fornecedor**, **Modal**
- Botão "+ Adicionar Part Number" para inserir mais linhas dinamicamente
- Botão "X" em cada linha para remover
- Ao salvar o pacote, todos os PNs são criados automaticamente com o `packageId` e `projectId` do pacote

### 4. Adicionar coluna "Pacote" na tabela de Part Numbers (`PartNumbersPage.tsx`)
- Nova coluna exibindo o `sourcePackageNumber` do pacote vinculado (ou "—" se não houver)
- Lookup pelo `packageId` no contexto de dados

### 5. Atualizar `PackagesPage.tsx` e `PartNumbersPage.tsx`
- Substituir `useState` local por `useData()` do novo contexto
- Manter toda a lógica de filtros, export/import e CRUD funcionando

### 6. Atualizar mock data (`src/data/mockData.ts`)
- Adicionar `packageId` aos Part Numbers existentes para manter consistência

### Arquivos afetados
- `src/data/types.ts` — adicionar `packageId`
- `src/data/mockData.ts` — adicionar `packageId` nos mocks
- `src/contexts/DataContext.tsx` — novo arquivo
- `src/App.tsx` — envolver com `DataProvider`
- `src/pages/PackagesPage.tsx` — formulário com PNs dinâmicos + usar contexto
- `src/pages/PartNumbersPage.tsx` — coluna "Pacote" + usar contexto
- `src/pages/ProjectDetailPage.tsx` — usar contexto
- `src/pages/OverviewPage.tsx` — usar contexto (se referencia dados)

