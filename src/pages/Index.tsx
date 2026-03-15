import { useState } from "react";
import { projects as initialProjects } from "@/data/mockData";
import { Project, ProjectStatus } from "@/data/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

const Index = () => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "Planejamento" as ProjectStatus,
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: form.name,
      description: form.description || "TBD",
      status: form.status,
      totalPackages: 0,
      totalPNs: 0,
      progress: 0,
    };
    setProjects((prev) => [...prev, newProject]);
    setForm({ name: "", description: "", status: "Planejamento" });
    setOpen(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">GST Sourcing Manager</h1>
        <p className="text-xl text-muted-foreground mb-8">
          {projects.length} projeto(s) cadastrado(s)
        </p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus size={20} />
              Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Projeto</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Nome do Projeto *</label>
                <Input
                  placeholder="Ex: Alpha SUV 2027"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Descrição</label>
                <Input
                  placeholder="TBD"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Status</label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as ProjectStatus }))}>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Em Andamento", "Planejamento", "Finalizado"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleSubmit} disabled={!form.name.trim()}>
                Adicionar Projeto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
