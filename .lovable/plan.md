

# Sistema de Login/Cadastro — GST Sourcing Manager

## Resumo
Adicionar autenticação com Supabase (email/senha), incluindo páginas de Login, Cadastro e Recuperação de Senha. Rotas protegidas redirecionam para login. Perfil do funcionário armazenado em tabela `profiles` (nome, email, área).

## Pré-requisito
- Ativar **Lovable Cloud** (Supabase integrado) para ter banco de dados e autenticação

## Mudanças

### 1. Habilitar Lovable Cloud / Supabase
- Criar cliente Supabase (`src/integrations/supabase/client.ts`)

### 2. Banco de dados — Migrations
- **Tabela `profiles`**: `id (uuid FK auth.users)`, `nome (text)`, `email (text)`, `area (text)`, `created_at`
- Trigger `on_auth_user_created` para criar perfil automaticamente no signup
- RLS: usuário lê/atualiza apenas seu próprio perfil

### 3. Contexto de autenticação (`src/contexts/AuthContext.tsx`)
- Provider com `user`, `profile`, `loading`, `signIn`, `signUp`, `signOut`
- Listener `onAuthStateChange` + fetch do perfil na tabela `profiles`

### 4. Páginas de autenticação
- **`src/pages/LoginPage.tsx`** — formulário email/senha com título "GST Sourcing Manager", link para cadastro e recuperação de senha
- **`src/pages/SignUpPage.tsx`** — formulário com nome, email, área, senha; chama `signUp` + insere perfil
- **`src/pages/ResetPasswordPage.tsx`** — formulário para definir nova senha (rota `/reset-password`)
- Estilo escuro consistente com o tema atual (fundo `--background`, botão `--primary` verde)

### 5. Rota protegida (`src/components/ProtectedRoute.tsx`)
- Redireciona para `/login` se não autenticado
- Mostra loading enquanto verifica sessão

### 6. Atualizar roteamento (`src/App.tsx`)
- Rotas públicas: `/login`, `/cadastro`, `/reset-password`
- Todas as rotas existentes envolvidas com `ProtectedRoute`

### 7. Header com usuário logado (`src/components/AppLayout.tsx`)
- Exibir nome do funcionário no header
- Botão de logout

### Arquivos afetados
- `src/integrations/supabase/client.ts` — novo
- `src/contexts/AuthContext.tsx` — novo
- `src/components/ProtectedRoute.tsx` — novo
- `src/pages/LoginPage.tsx` — novo
- `src/pages/SignUpPage.tsx` — novo
- `src/pages/ResetPasswordPage.tsx` — novo
- `src/App.tsx` — rotas atualizadas
- `src/components/AppLayout.tsx` — nome do usuário + logout
- 1 migration SQL — tabela profiles + trigger + RLS

