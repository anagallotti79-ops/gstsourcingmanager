

# Duas alterações: Dados do Alpha SUV + Renomear sistema para NEXUS

## 1. Corrigir datas do Alpha SUV (`src/data/mockData.ts`)

O usuário quer a distribuição: **Feb(1), Apr(1), May(1), Jun(1), Jul(2)** — sem nenhum em Mar.

Datas atuais vs. novas para os 6 pacotes do proj-1:

| Pacote | Atual | Novo |
|--------|-------|------|
| pkg-1 (Chassi) | 2025-07-15 (Jul) | 2025-07-15 (Jul) ✓ |
| pkg-2 (Motor) | 2025-06-01 (Jun) | 2025-06-15 (Jun) |
| pkg-3 (Freios/Closed) | 2025-03-01 (Mar) | 2025-02-15 (Feb) |
| pkg-4 (Painel) | 2025-05-01 (May) | 2025-05-15 (May) |
| pkg-5 (Suspensão) | 2025-06-20 (Jun→Jul) | 2025-07-20 (Jul) |
| pkg-6 (Arrefecimento) | 2025-08-01 (Aug) | 2025-04-15 (Apr) |

Resultado: Feb(1), Apr(1), May(1), Jun(1), Jul(2) — exatamente como pedido.

## 2. Renomear sistema para "NEXUS" (`6 arquivos`)

Substituir todas as referências "GST Sourcing Manager" / "GST Sourcing" por "NEXUS" com o subtítulo "Integrated Sourcing Control Platform".

Além disso, copiar o logo enviado (`Nexus.png`) para `src/assets/` e usá-lo na sidebar e na tela de login.

**Arquivos afetados:**
- `src/components/AppSidebar.tsx` — nome + logo
- `src/components/AppLayout.tsx` — header
- `src/pages/LoginPage.tsx` — título
- `src/pages/SignUpPage.tsx` — descrição
- `src/pages/Index.tsx` — título
- `index.html` — título da aba e meta tags

