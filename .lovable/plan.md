## Objetivo
Remover toda a camada de autenticação do app. O NEXUS ficará totalmente aberto — qualquer pessoa acessa direto o dashboard, sem login/cadastro/recuperação de senha.

## Mudanças no frontend

**Rotas (`src/App.tsx`)**
- Remover `AuthProvider`, `ProtectedRoute`, `LoginPage`, `SignUpPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `ProfilePage`.
- Deixar `AppLayout` envolvendo diretamente as rotas: `/`, `/projeto/:id`, `/pacotes`, `/part-numbers`, `/cancelados`.

**Layout (`src/components/AppLayout.tsx`)**
- Remover uso de `useAuth`, do nome do perfil e do botão "Sair" no topo.

**Sidebar (`src/components/AppSidebar.tsx`)**
- Remover o item de menu "Perfil".

**Arquivos deletados**
- `src/contexts/AuthContext.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/SignUpPage.tsx`
- `src/pages/ForgotPasswordPage.tsx`
- `src/pages/ResetPasswordPage.tsx`
- `src/pages/ProfilePage.tsx`

## Backend (Lovable Cloud)
- Não vou apagar tabelas nem usuários existentes para não perder dados. A tabela `profiles`, `user_roles` e as funções `has_role`/`handle_new_user` continuam no backend, apenas deixam de ser usadas pelo app.
- Se quiser depois fazer a limpeza completa (drop das tabelas e usuários), me avise em uma etapa separada.

## O que NÃO muda
- Dashboard, pacotes, part numbers, cancelados, importação/exportação, previsões — tudo continua funcionando igual, só sem exigir login.
