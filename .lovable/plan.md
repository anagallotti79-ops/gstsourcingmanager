# Exportar projeto como arquivo ZIP

## Objetivo
Gerar um arquivo `.zip` do projeto NEXUS para download, com os arquivos de código fonte e sem dados sensíveis ou dependências instaladas.

## O que será incluído
- Toda a estrutura de código do projeto (`src/`, `supabase/`, `index.html`, `package.json`, `tsconfig.json`, `tailwind.config.ts`, `vite.config.ts`, etc.)
- Assets e componentes criados (logo `Nexus.png`, tema, páginas, etc.)

## O que será excluído
- `node_modules/` (pode ser reinstalado com `bun install`)
- `.env` (contém credenciais/URLs do backend)
- Arquivos de build/cache (`.git/`, `dist/`, `.lovable/`, etc.)

## Entrega
- O arquivo será salvo em `/mnt/documents/nexus-project.zip`
- Você poderá fazer o download diretamente pelo painel de artefatos

## Pós-entrega
- Confirmar que o zip foi gerado com sucesso
- Informar o comando para reinstalar dependências localmente (`bun install`)