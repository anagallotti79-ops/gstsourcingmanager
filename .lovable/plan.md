

# Página de Perfil + Sistema de Admin

## Resumo
Criar página de perfil para edição de nome, área e senha. Adicionar sistema de roles (admin) com tabela `user_roles` seguindo as melhores práticas de segurança.

## Mudanças

### 1. Migration — Tabela `user_roles` + função `has_role`
- Criar enum `app_role` com valores `admin`, `user`
- Criar tabela `user_roles` (`user_id`, `role`) com RLS
- Criar função `has_role()` (SECURITY DEFINER) para verificar roles sem recursão
- Política: usuários autenticados podem ler suas próprias roles
- Admins podem ler todas as roles (via `has_role`)

### 2. Nova página `ProfilePage.tsx` (`/perfil`)
- Formulário com campos: Nome, Área (pré-preenchidos do perfil atual)
- Seção separada para alteração de senha (senha atual não necessária via Supabase `updateUser`)
- Botão salvar que faz `supabase.from('profiles').update(...)` + `supabase.auth.updateUser({ password })`

### 3. Atualizar `AuthContext.tsx`
- Adicionar campo `isAdmin` ao contexto
- Buscar role do usuário na tabela `user_roles` após login
- Expor `isAdmin` para uso nos componentes

### 4. Atualizar navegação
- Adicionar link "Perfil" no sidebar (`AppSidebar.tsx`) com ícone User
- Adicionar rota `/perfil` no `App.tsx`

### 5. Painel Admin (visível apenas para admins)
- Seção na página de perfil ou link no sidebar (apenas se admin)
- Listar usuários cadastrados e permitir atribuir/remover role admin

### Arquivos afetados
- 1 migration SQL (user_roles + has_role + RLS)
- `src/pages/ProfilePage.tsx` — novo
- `src/contexts/AuthContext.tsx` — adicionar isAdmin
- `src/components/AppSidebar.tsx` — link Perfil
- `src/App.tsx` — rota /perfil

