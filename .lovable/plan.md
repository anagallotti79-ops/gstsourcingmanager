

# Correlacionar Pacotes ↔ Part Numbers na Exportação e Importação

## Resumo
Atualizar a lógica de exportação e importação para que:
- **Exportação de Pacotes**: inclua colunas dos PNs vinculados (cada PN em uma linha separada, repetindo dados do pacote)
- **Exportação de PNs**: inclua coluna "Pacote" (sourcePackageNumber) — já existe
- **Importação de Pacotes**: linhas que contenham dados de PN (coluna "PN" preenchida) criam automaticamente os PNs na aba de Part Numbers
- **Importação de PNs**: verifica se o pacote (coluna "Pacote" ou "Source Package") já existe na lista; se não existir, cria o pacote automaticamente na aba de Pacotes

## Mudanças

### 1. PackagesPage.tsx — Exportação
- Alterar `pkgColumns` e `handleExportExcel`/`handleExportPDF` para exportar dados "explodidos": cada pacote gera N linhas (uma por PN vinculado), com colunas do pacote + colunas do PN (PN, ERA, Descrição PN, Fornecedor, Modal, Status PO, PO, etc.)
- Pacotes sem PNs geram 1 linha com colunas de PN vazias

### 2. PackagesPage.tsx — Importação
- Após criar os pacotes, verificar se cada linha tem coluna "PN" preenchida
- Se sim, agrupar PNs pelo pacote (mesmo Source Package = mesmo packageId) e criar os PNs automaticamente via `addPartNumbers`
- Evitar duplicar pacotes: linhas com mesmo `Source Package` geram 1 pacote + N PNs

### 3. PartNumbersPage.tsx — Importação
- Após ler o arquivo, verificar a coluna "Pacote" ou "Source Package" de cada linha
- Para cada valor único, buscar no `pkgList` se já existe um pacote com aquele `sourcePackageNumber`
- Se existir: usar o `id` dele como `packageId` do PN
- Se não existir: criar um pacote mínimo (com sourcePackageNumber e dados padrão) via `addPackage` e usar o novo `id`

### 4. PartNumbersPage.tsx — Exportação
- Já exporta coluna "Pacote" — sem mudanças necessárias

### Arquivos afetados
- `src/pages/PackagesPage.tsx` — exportação explodida + importação com PNs
- `src/pages/PartNumbersPage.tsx` — importação com criação automática de pacotes

