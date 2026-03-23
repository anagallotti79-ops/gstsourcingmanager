import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Shield, UserCog, Trash2 } from "lucide-react";

interface UserWithRole {
  user_id: string;
  nome: string;
  email: string;
  area: string;
  role: string | null;
}

export default function ProfilePage() {
  const { profile, isAdmin, user } = useAuth();
  const [nome, setNome] = useState("");
  const [area, setArea] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (profile) {
      setNome(profile.nome);
      setArea(profile.area);
    }
  }, [profile]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data: profiles } = await supabase.from("profiles").select("user_id, nome, email, area");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");

    if (profiles) {
      const roleMap = new Map(roles?.map((r) => [r.user_id, r.role]) ?? []);
      setUsers(
        profiles.map((p) => ({
          ...p,
          role: roleMap.get(p.user_id) ?? null,
        }))
      );
    }
    setLoadingUsers(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ nome, area })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Erro ao salvar perfil");
    } else {
      toast.success("Perfil atualizado com sucesso");
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error("Erro ao alterar senha");
    } else {
      toast.success("Senha alterada com sucesso");
      setPassword("");
      setConfirmPassword("");
    }
    setSavingPassword(false);
  };

  const toggleAdmin = async (targetUserId: string, currentRole: string | null) => {
    if (targetUserId === user?.id) {
      toast.error("Você não pode alterar seu próprio papel");
      return;
    }

    if (currentRole === "admin") {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", targetUserId)
        .eq("role", "admin");
      if (error) toast.error("Erro ao remover admin");
      else toast.success("Admin removido");
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: targetUserId, role: "admin" as any });
      if (error) toast.error("Erro ao adicionar admin");
      else toast.success("Admin adicionado");
    }
    fetchUsers();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Dados Pessoais
          </CardTitle>
          <CardDescription>Atualize seu nome e área de atuação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="area">Área</Label>
            <Input id="area" value={area} onChange={(e) => setArea(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile?.email ?? ""} disabled className="opacity-60" />
          </div>
          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>Defina uma nova senha para sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha"
            />
          </div>
          <Button onClick={handleChangePassword} disabled={savingPassword}>
            {savingPassword ? "Alterando..." : "Alterar Senha"}
          </Button>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Administração de Usuários
            </CardTitle>
            <CardDescription>Gerencie os papéis dos usuários cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : (
              <div className="space-y-3">
                {users.map((u) => (
                  <div
                    key={u.user_id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{u.nome || u.email}</p>
                      <p className="text-xs text-muted-foreground">{u.email} · {u.area}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {u.role === "admin" && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          Admin
                        </span>
                      )}
                      {u.user_id !== user?.id && (
                        <Button
                          variant={u.role === "admin" ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => toggleAdmin(u.user_id, u.role)}
                        >
                          {u.role === "admin" ? (
                            <><Trash2 className="h-3 w-3 mr-1" /> Remover</>
                          ) : (
                            <><Shield className="h-3 w-3 mr-1" /> Tornar Admin</>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
