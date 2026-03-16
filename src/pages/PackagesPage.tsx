import { useState, useMemo, useEffect } from "react";
import { packages as initialPackages, projects } from "@/data/mockData";
import { useCancelled } from "@/contexts/CancelledContext";
import { Package, PackageStatus, PhaseTargetStatus, DmDivision, PackageCategory } from "@/data/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { formatDate, calculateWeeks, calculatePredictionWeeks, getDateStatus } from "@/lib/dateUtils";
import type { DateField } from "@/data/types";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger,
} from "@/components/ui/context-menu";

function DateCell({ field }: { field: DateField }) {
  const status = getDateStatus(field);
  const dateStr = field.done || field.target;
  const colorClass =
    status === "done" ? "text-success" :
    status === "late" ? "text-destructive" :
    "text-muted-foreground";
  return <span className={`text-xs font-medium ${colorClass}`}>{formatDate(dateStr)}</span>;
}

const blankForm = {
  projectId: "", sourcePackageNumber: "", description: "", ppm: "", pb: "",
  dmDivision: "DMCA" as DmDivision, category: "SPF" as PackageCategory,
  status: "Source Package" as PackageStatus, phaseTargetStatus: "On Track" as PhaseTargetStatus,
  createdDate: "", totalDays: "", recommendationPredictionDate: "",
  tkoTarget: "", tkoDone: "", otTarget: "", otDone: "", otopTarget: "", otopDone: "",
  comments: "",
};

type FormState = typeof blankForm;

function PkgForm({ form, setForm }: { form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>> }) {
  const f = (key: keyof FormState, label: string, placeholder = "TBD") => (
    <div key={key}>
      <label className="text-sm font-medium text-foreground mb-1 block">{label}</label>
      <Input placeholder={placeholder} value={form[key] as string}
        onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))}
        className="bg-card border-border" />
    </div>
  );
  const sel = <K extends keyof FormState>(key: K, label: string, opts: string[]) => (
    <div key={key}>
      <label className="text-sm font-medium text-foreground mb-1 block">{label}</label>
      <Select value={form[key] as string} onValueChange={(v) => setForm((s) => ({ ...s, [key]: v }))}>
        <SelectTrigger className="bg-card border-border"><SelectValue /></SelectTrigger>
        <SelectContent>{opts.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
  return (
    <div className="space-y-3 py-2">
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Projeto</label>
        <Select value={form.projectId} onValueChange={(v) => setForm((s) => ({ ...s, projectId: v }))}>
          <SelectTrigger className="bg-card border-border"><SelectValue placeholder="Selecione o projeto" /></SelectTrigger>
          <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {f("sourcePackageNumber", "Source Package Number")}
      {f("description", "Descrição")}
      {f("ppm", "PPM")} {f("pb", "PB")}
      {sel("dmDivision", "DM Division", ["DMCA", "DMPT", "DMEM", "DMBI"])}
      {sel("category", "Categoria", ["SPF", "TH", "PWT", "MO"])}
      {sel("status", "Status", ["Source Package", "Pre-RFQ", "RFQ", "Offer Review", "Negotiation", "Summary", "Recommendation", "Closed"])}
      {sel("phaseTargetStatus", "Target Status", ["On Track", "At Risk", "Late"])}
      {f("createdDate", "Data de Criação (AAAA-MM-DD)", "2025-01-01")}
      {f("totalDays", "Total de Dias", "90")}
      {f("recommendationPredictionDate", "Previsão Recommendation (AAAA-MM-DD)", "2025-12-01")}
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide pt-1">TKO</p>
      {f("tkoTarget", "TKO - Target (AAAA-MM-DD)")} {f("tkoDone", "TKO - Done (AAAA-MM-DD)")}
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide pt-1">OT</p>
      {f("otTarget", "OT - Target (AAAA-MM-DD)")} {f("otDone", "OT - Done (AAAA-MM-DD)")}
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide pt-1">OTOP</p>
      {f("otopTarget", "OTOP - Target (AAAA-MM-DD)")} {f("otopDone", "OTOP - Done (AAAA-MM-DD)")}
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide pt-1">Comentários</p>
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Comentários</label>
        <textarea
          placeholder="Adicione observações sobre este pacote..."
          value={form.comments || ""}
          onChange={(e) => setForm((s) => ({ ...s, comments: e.target.value }))}
          className="w-full rounded-md border border-border bg-card text-foreground text-sm p-2 min-h-[80px] resize-y placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
    </div>
  );
}

function pkgToForm(pkg: Package): FormState {
  return {
    projectId: pkg.projectId, sourcePackageNumber: pkg.sourcePackageNumber,
    description: pkg.description, ppm: pkg.ppm, pb: pkg.pb,
    dmDivision: pkg.dmDivision, category: pkg.category, status: pkg.status,
    phaseTargetStatus: pkg.phaseTargetStatus,
    createdDate: pkg.createdDate, totalDays: String(pkg.totalDays),
    recommendationPredictionDate: pkg.recommendationPredictionDate,
    tkoTarget: pkg.tko.target, tkoDone: pkg.tko.done || "",
    otTarget: pkg.ot.target, otDone: pkg.ot.done || "",
    otopTarget: pkg.otop.target, otopDone: pkg.otop.done || "",
    comments: pkg.comments || "",
  };
}

function formToPkg(form: FormState, id: string): Package {
  return {
    id, projectId: form.projectId || "proj-1",
    sourcePackageNumber: form.sourcePackageNumber || "TBD",
    description: form.description || "TBD", ppm: form.ppm || "TBD", pb: form.pb || "TBD",
    dmDivision: form.dmDivision, category: form.category, status: form.status,
    phaseTargetStatus: form.phaseTargetStatus,
    createdDate: form.createdDate || new Date().toISOString().slice(0, 10),
    totalDays: Number(form.totalDays) || 0,
    recommendationPredictionDate: form.recommendationPredictionDate || "TBD",
    tko: { target: form.tkoTarget || "TBD", done: form.tkoDone || undefined },
    ot: { target: form.otTarget || "TBD", done: form.otDone || undefined },
    otop: { target: form.otopTarget || "TBD", done: form.otopDone || undefined },
    comments: form.comments || "",
  };
}

export default function PackagesPage() {
  const [pkgList, setPkgList] = useState<Package[]>(initialPackages);
  const { cancelPackage, cancelledPackages, restorePackage } = useCancelled();

  // Listen for restored packages
  const [lastRestoredPkg, setLastRestoredPkg] = useState<string | null>(null);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(blankForm);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<FormState>(blankForm);
  const [editId, setEditId] = useState<string | null>(null);

  // Delete confirm dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return pkgList.filter((pkg) => {
      const matchSearch = search === "" ||
        pkg.sourcePackageNumber.toLowerCase().includes(search.toLowerCase()) ||
        pkg.description.toLowerCase().includes(search.toLowerCase());
      const matchDM = filterDM === "all" || pkg.dmDivision === filterDM;
      const matchStatus = filterStatus === "all" || pkg.status === filterStatus;
      const matchProject = filterProject === "all" || pkg.projectId === filterProject;
      const matchCategory = filterCategory === "all" || pkg.category === filterCategory;
      return matchSearch && matchDM && matchStatus && matchProject && matchCategory;
    });
  }, [pkgList, search, filterDM, filterStatus, filterProject, filterCategory]);

  const targetBadge = (status: string) => {
    if (status === "On Track") return <span className="flex items-center gap-1 text-xs font-medium text-success"><CheckCircle2 size={13} />On Track</span>;
    if (status === "At Risk")  return <span className="flex items-center gap-1 text-xs font-medium text-warning"><AlertTriangle size={13} />At Risk</span>;
    return <span className="flex items-center gap-1 text-xs font-medium text-destructive"><XCircle size={13} />Late</span>;
  };

  const totalClosed = pkgList.filter((p) => p.status === "Closed").length;
  const progressPercentage = pkgList.length > 0 ? Math.round((totalClosed / pkgList.length) * 100) : 0;

  const handleCreate = () => {
    setPkgList((prev) => [...prev, formToPkg(createForm, `pkg-${Date.now()}`)]);
    setCreateForm(blankForm);
    setCreateOpen(false);
  };

  const openEdit = (pkg: Package) => {
    setEditId(pkg.id);
    setEditForm(pkgToForm(pkg));
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!editId) return;
    setPkgList((prev) => prev.map((p) => p.id === editId ? formToPkg(editForm, editId) : p));
    setEditOpen(false);
    setEditId(null);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setPkgList((prev) => prev.filter((p) => p.id !== deleteId));
    setDeleteId(null);
  };

  const handleCancel = (pkg: Package) => {
    cancelPackage(pkg);
    setPkgList((prev) => prev.filter((p) => p.id !== pkg.id));
  };

  // Restore handler: poll for changes in cancelledPackages length
  useEffect(() => {
    // Check if a package was restored that belongs to this list
    const handler = () => {
      // This is handled via the context - packages are restored via CancelledPage
    };
    handler();
  }, [cancelledPackages]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacotes</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão e acompanhamento de source packages</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus size={16} />Novo Pacote</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Novo Pacote</DialogTitle></DialogHeader>
            <PkgForm form={createForm} setForm={setCreateForm} />
            <DialogFooter className="gap-2">
              <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
              <Button onClick={handleCreate}>Adicionar Pacote</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar Pacote</DialogTitle></DialogHeader>
          <PkgForm form={editForm} setForm={setEditForm} />
          <DialogFooter className="gap-2">
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={handleEdit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Excluir Pacote</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Tem certeza que deseja excluir este pacote? Esta ação não pode ser desfeita.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progress */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-foreground">Progresso de Fechamento de Pacotes</h3>
            <span className="text-sm font-bold text-primary">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">{totalClosed} de {pkgList.length} Pacotes Fechados.</p>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar pacote..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card border-border text-foreground h-9 text-sm" />
        </div>
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger className="w-[160px] bg-card border-border h-9 text-sm"><SelectValue placeholder="Projeto" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Projetos</SelectItem>
            {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterDM} onValueChange={setFilterDM}>
          <SelectTrigger className="w-[130px] bg-card border-border h-9 text-sm"><SelectValue placeholder="DM Division" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas DM</SelectItem>
            {["DMCA", "DMPT", "DMEM", "DMBI"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px] bg-card border-border h-9 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            {["Source Package", "Pre-RFQ", "RFQ", "Offer Review", "Negotiation", "Summary", "Recommendation", "Closed"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[120px] bg-card border-border h-9 text-sm"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Cat.</SelectItem>
            {["SPF", "TH", "PWT", "MO"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <p className="text-[10px] text-muted-foreground px-3 pt-2 italic">Clique com o botão direito em uma linha para editar, excluir ou cancelar</p>
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-border">
                  {["Source Package", "Descrição", "PPM", "PB", "DM Div.", "Cat.", "Status", "Target Status", "Sem. Total", "Sem. Previsão", "Data Previsão", "TKO", "OT", "OTOP", "Comentários"].map((h) => (
                    <th key={h} className="p-3 text-left text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((pkg, i) => (
                  <ContextMenu key={pkg.id}>
                    <ContextMenuTrigger asChild>
                      <tr className={`border-b border-border/50 hover:bg-primary/10 cursor-pointer transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                        <td className="p-3 font-medium text-foreground whitespace-nowrap">{pkg.sourcePackageNumber}</td>
                        <td className="p-3 text-muted-foreground max-w-[180px] truncate">{pkg.description}</td>
                        <td className="p-3 text-muted-foreground">{pkg.ppm}</td>
                        <td className="p-3 text-muted-foreground">{pkg.pb}</td>
                        <td className="p-3"><Badge variant="outline" className="text-[10px]">{pkg.dmDivision}</Badge></td>
                        <td className="p-3 text-muted-foreground">{pkg.category}</td>
                        <td className="p-3"><Badge variant="secondary" className="text-[10px]">{pkg.status}</Badge></td>
                        <td className="p-3">{targetBadge(pkg.phaseTargetStatus)}</td>
                        <td className="p-3 text-muted-foreground">{calculateWeeks(pkg.totalDays)}</td>
                        <td className="p-3 text-muted-foreground">{calculatePredictionWeeks(pkg.createdDate, pkg.recommendationPredictionDate)}</td>
                        <td className="p-3 text-muted-foreground whitespace-nowrap">{formatDate(pkg.recommendationPredictionDate)}</td>
                        <td className="p-3 whitespace-nowrap"><DateCell field={pkg.tko} /></td>
                        <td className="p-3 whitespace-nowrap"><DateCell field={pkg.ot} /></td>
                        <td className="p-3 whitespace-nowrap"><DateCell field={pkg.otop} /></td>
                        <td className="p-3 text-muted-foreground max-w-[160px]">
                          {pkg.comments
                            ? <span title={pkg.comments} className="block truncate max-w-[140px] cursor-help">{pkg.comments}</span>
                            : <span className="text-muted-foreground/40">—</span>}
                        </td>
                      </tr>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-40">
                      <ContextMenuItem className="gap-2 cursor-pointer" onClick={() => openEdit(pkg)}>
                        ✏️ Editar
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive" onClick={() => setDeleteId(pkg.id)}>
                        🗑️ Excluir
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={15} className="p-8 text-center text-muted-foreground">Nenhum pacote encontrado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">{filtered.length} de {pkgList.length} pacotes</p>
    </div>
  );
}
