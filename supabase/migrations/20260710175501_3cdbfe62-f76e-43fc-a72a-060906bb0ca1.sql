
-- has_role is invoked by RLS policies as the querying user; it must be executable by authenticated
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
