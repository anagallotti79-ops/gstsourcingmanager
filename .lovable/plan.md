

# Exportar e Importar — Pacotes e Part Numbers

## O que será feito

Adicionar botões funcionais de **Exportar (Excel + PDF)** e **Importar (Excel/CSV)** nas páginas de Pacotes e Part Numbers.

## Bibliotecas necessárias
- **xlsx** (SheetJS) — leitura e escrita de arquivos Excel/CSV
- **jspdf** + **jspdf-autotable** — geração de PDF com tabelas formatadas

## Mudanças

### 1. Criar utilitário compartilhado (`src/lib/exportUtils.ts`)
- `exportToExcel(data, columns, fileName)` — converte array de objetos em planilha .xlsx e dispara download
- `exportToPDF(data, columns, fileName, title)` — gera PDF com tabela autoformatada e dispara download
- `parseImportedFile(file): Promise<Record<string,string>[]>` — lê arquivo .xlsx ou .csv e retorna array de objetos

### 2. Atualizar PackagesPage.tsx
- Adicionar 3 botões no header (ao lado de "Novo Pacote"):
  - **Exportar Excel** (ícone FileSpreadsheet) — exporta `filtered` para .xlsx
  - **Exportar PDF** (ícone FileText) — exporta `filtered` para PDF
  - **Importar** (ícone Upload) — abre file input hidden, lê o arquivo, converte cada linha em Package e adiciona à lista
- Mapeamento de colunas do arquivo importado para os campos do tipo `Package`

### 3. Atualizar PartNumbersPage.tsx
- Mesma lógica: 3 botões no header
- Mapeamento de colunas para os campos do tipo `PartNumber`

### 4. Feedback ao usuário
- Toast de sucesso após exportação ("Exportado com sucesso")
- Toast de sucesso/erro após importação ("X itens importados" ou "Erro ao ler arquivo")

## Fluxo de Importação
1. Usuário clica "Importar" → abre seletor de arquivo (.xlsx, .csv)
2. Sistema lê o arquivo com SheetJS e mapeia colunas pelos nomes dos headers
3. Linhas válidas são adicionadas à lista com IDs gerados automaticamente
4. Toast confirma quantos itens foram importados

