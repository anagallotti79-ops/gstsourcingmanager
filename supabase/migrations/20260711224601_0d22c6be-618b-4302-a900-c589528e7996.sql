
-- Convert has_role to SECURITY INVOKER to satisfy linter.
-- Add SELECT policy so authenticated users can read their own roles
-- (required for the invoker-mode function to work inside RLS policies).

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Ensure authenticated role can read their own role rows for the invoker function.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_roles'
      AND policyname = 'Users can view their own roles'
  ) THEN
    CREATE POLICY "Users can view their own roles"
      ON public.user_roles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
