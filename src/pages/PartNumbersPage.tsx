import { useState, useMemo, useRef } from "react";
import { projects } from "@/data/mockData";
import { useData } from "@/contexts/DataContext";
import { useCancelled } from "@/contexts/CancelledContext";
import { PartNumber, Modal, StatusPO, StatusRDA, StatusTPO, Package, DmDivision, PackageCategory, PackageStatus, PhaseTargetStatus } from "@/data/types";
import type { DateField } from "@/data/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Clock, Loader2, Plus, CheckCircle2, AlertTriangle, Minus, FileSpreadsheet, FileText, Upload, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { exportToExcel, exportToPDF, parseImportedFile, type ExportColumn } from "@/lib/exportUtils";
import { useToast } from "@/hooks/use-toast";
import { formatDate, getDateStatus } from "@/lib/dateUtils";

function DateCell({ field }: { field: DateField }) {
  const status = getDateStatus(field);
  const dateStr = field.done || field.target;
  const colorClass =
    status === "done" ? "text-success" :
    status === "late" ? "text-destructive" :
    "text-muted-foreground";
  return <span className={`text-xs font-medium ${colorClass}`}>{formatDate(dateStr)}</span>;
}

const statusPOBadge = (status: string) => {
  if (status === "Com PO")    return <span className="flex items-center gap-1 text-xs font-medium text-success"><CheckCircle2 size={13} />{status}</span>;
  if (status === "Pendente")  return <span className="flex items-center gap-1 text-xs font-medium text-warning"><Clock size={13} />{status}</span>;
  if (status === "In Process") return <span className="flex items-center gap-1 text-xs font-medium text-info"><Loader2 size={13} />{status}</span>;
  if (status === "NA")        return <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground"><Minus size={13} />{status}</span>;
  return <span className="text-xs text-muted-foreground">{status}</span>;
};

const blankForm = {
  projectId: "", pn: "", pnEra: "", projeto: "", description: "", pb: "", fornecedor: "",
  modal: "Nacional" as Modal, statusPO: "Pendente" as StatusPO, po: "", previsaoEmissaoPO: "",
  rda: "", statusRDA: "NA" as StatusRDA, tpo: "", statusTPO: "NA" as StatusTPO, previsaoEmissaoTPO: "",
  tkoTarget: "", tkoDone: "", otTarget: "", otDone: "", otopTarget: "", otopDone: "",
  comments: "",
};

type FormState = typeof blankForm;

function PNForm({ form, setForm }: { form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>> }) {
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
        <Select value={form.projectId} onValueChange={(v) => {
          const proj = projects.find((p) => p.id === v);
          setForm((s) => ({ ...s, projectId: v, projeto: proj?.name || s.projeto }));
        }}>
          <SelectTrigger className="bg-card border-border"><SelectValue placeholder="Selecione o projeto" /></SelectTrigger>
          <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {f("pn", "PN *")}
      {f("pnEra", "ERA")}
      {f("description", "Descrição")}
      {f("pb", "PB")}
      {f("fornecedor", "Fornecedor")}
      {sel("modal", "Modal", ["IRF", "Direct Buy", "Nacional"])}
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide pt-1">TKO</p>
      {f("tkoTarget", "TKO - Target (AAAA-MM-DD)")} {f("tkoDone", "TKO - Done (AAAA-MM-DD)")}
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide pt-1">OT</p>
      {f("otTarget", "OT - Target (AAAA-MM-DD)")} {f("otDone", "OT - Done (AAAA-MM-DD)")}
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide pt-1">OTOP</p>
      {f("otopTarget", "OTOP - Target (AAAA-MM-DD)")} {f("otopDone", "OTOP - Done (AAAA-MM-DD)")}
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide pt-1">PO</p>
      {sel("statusPO", "Status PO", ["Com PO", "Pendente", "In Process"])}
      {f("po", "Número da PO")}
      {f("previsaoEmissaoPO", "Previsão Emissão PO (AAAA-MM-DD)")}
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide pt-1">RDA</p>
      {f("rda", "Número RDA")}
      {sel("statusRDA", "Status RDA", ["Com PO", "Pendente", "In Process", "NA"])}
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide pt-1">TPO</p>
      {f("tpo", "Número TPO")}
      {sel("statusTPO", "Status TPO", ["Com PO", "Pendente", "In Process", "NA"])}
      {f("previsaoEmissaoTPO", "Previsão Emissão TPO (AAAA-MM-DD)")}
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide pt-1">Comentários</p>
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Comentários</label>
        <textarea
          placeholder="Adicione observações sobre este Part Number..."
          value={form.comments || ""}
          onChange={(e) => setForm((s) => ({ ...s, comments: e.target.value }))}
          className="w-full rounded-md border border-border bg-card text-foreground text-sm p-2 min-h-[80px] resize-y placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
    </div>
  );
}

function pnToForm(pn: PartNumber): FormState {
  return {
    projectId: pn.projectId, pn: pn.pn, pnEra: pn.pnEra, projeto: pn.projeto,
    description: pn.description, pb: pn.pb, fornecedor: pn.fornecedor,
    modal: pn.modal, statusPO: pn.statusPO, po: pn.po, previsaoEmissaoPO: pn.previsaoEmissaoPO,
    rda: pn.rda, statusRDA: pn.statusRDA, tpo: pn.tpo, statusTPO: pn.statusTPO,
    previsaoEmissaoTPO: pn.previsaoEmissaoTPO,
    tkoTarget: pn.tko.target, tkoDone: pn.tko.done || "",
    otTarget: pn.ot.target, otDone: pn.ot.done || "",
    otopTarget: pn.otop.target, otopDone: pn.otop.done || "",
    comments: pn.comments || "",
  };
}

function formToPN(form: FormState, id: string, packageId?: string): PartNumber {
  const proj = projects.find((p) => p.id === form.projectId);
  return {
    id, projectId: form.projectId || "proj-1",
    packageId,
    pn: form.pn || "TBD", pnEra: form.pnEra || "TBD",
    projeto: form.projeto || proj?.name || "TBD",
    description: form.description || "TBD", pb: form.pb || "TBD",
    fornecedor: form.fornecedor || "TBD", modal: form.modal, statusPO: form.statusPO,
    po: form.po, previsaoEmissaoPO: form.previsaoEmissaoPO || "TBD",
    rda: form.rda, statusRDA: form.statusRDA, tpo: form.tpo,
    statusTPO: form.statusTPO, previsaoEmissaoTPO: form.previsaoEmissaoTPO,
    tko: { target: form.tkoTarget || "TBD", done: form.tkoDone || undefined },
    ot: { target: form.otTarget || "TBD", done: form.otDone || undefined },
    otop: { target: form.otopTarget || "TBD", done: form.otopDone || undefined },
    comments: form.comments || "",
  };
}

export default function PartNumbersPage() {
  const { pnList, setPnList, pkgList, addPackage } = useData();
  const { cancelPartNumber } = useCancelled();
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [filterModal, setFilterModal] = useState("all");
  const [filterStatusPO, setFilterStatusPO] = useState("all");

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(blankForm);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<FormState>(blankForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [editPackageId, setEditPackageId] = useState<string | undefined>(undefined);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return pnList.filter((pn) => {
      const matchSearch = search === "" ||
        pn.pn.toLowerCase().includes(search.toLowerCase()) ||
        pn.description.toLowerCase().includes(search.toLowerCase()) ||
        pn.fornecedor.toLowerCase().includes(search.toLowerCase());
      const matchProject = filterProject === "all" || pn.projectId === filterProject;
      const matchModal = filterModal === "all" || pn.modal === filterModal;
      const matchStatus = filterStatusPO === "all" || pn.statusPO === filterStatusPO;
      return matchSearch && matchProject && matchModal && matchStatus;
    });
  }, [pnList, search, filterProject, filterModal, filterStatusPO]);

  const totalComPO = pnList.filter((p) => p.statusPO === "Com PO").length;
  const totalPendente = pnList.filter((p) => p.statusPO === "Pendente").length;
  const totalInProcess = pnList.filter((p) => p.statusPO === "In Process").length;
  const progressPercentage = pnList.length > 0 ? Math.round((totalComPO / pnList.length) * 100) : 0;

  const handleCreate = () => {
    setPnList((prev) => [...prev, formToPN(createForm, `pn-${Date.now()}`)]);
    setCreateForm(blankForm);
    setCreateOpen(false);
  };

  const openEdit = (pn: PartNumber) => {
    setEditId(pn.id);
    setEditPackageId(pn.packageId);
    setEditForm(pnToForm(pn));
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!editId) return;
    setPnList((prev) => prev.map((p) => p.id === editId ? formToPN(editForm, editId, editPackageId) : p));
    setEditOpen(false);
    setEditId(null);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setPnList((prev) => prev.filter((p) => p.id !== deleteId));
    setDeleteId(null);
  };

  const handleCancel = (pn: PartNumber) => {
    cancelPartNumber(pn);
    setPnList((prev) => prev.filter((p) => p.id !== pn.id));
  };

  const getPackageName = (packageId?: string) => {
    if (!packageId) return "—";
    const pkg = pkgList.find((p) => p.id === packageId);
    return pkg?.sourcePackageNumber || "—";
  };

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pnColumns: ExportColumn[] = [
    { header: "PN", accessor: (r) => String((r as unknown as PartNumber).pn) },
    { header: "ERA", accessor: (r) => String((r as unknown as PartNumber).pnEra) },
    { header: "Projeto", accessor: (r) => String((r as unknown as PartNumber).projeto) },
    { header: "Descrição", accessor: (r) => String((r as unknown as PartNumber).description) },
    { header: "PB", accessor: (r) => String((r as unknown as PartNumber).pb) },
    { header: "Fornecedor", accessor: (r) => String((r as unknown as PartNumber).fornecedor) },
    { header: "Modal", accessor: (r) => String((r as unknown as PartNumber).modal) },
    { header: "Pacote", accessor: (r) => getPackageName((r as unknown as PartNumber).packageId) },
    { header: "TKO Target", accessor: (r) => String((r as unknown as PartNumber).tko.target) },
    { header: "TKO Done", accessor: (r) => String((r as unknown as PartNumber).tko.done || "") },
    { header: "OT Target", accessor: (r) => String((r as unknown as PartNumber).ot.target) },
    { header: "OT Done", accessor: (r) => String((r as unknown as PartNumber).ot.done || "") },
    { header: "OTOP Target", accessor: (r) => String((r as unknown as PartNumber).otop.target) },
    { header: "OTOP Done", accessor: (r) => String((r as unknown as PartNumber).otop.done || "") },
    { header: "Status PO", accessor: (r) => String((r as unknown as PartNumber).statusPO) },
    { header: "PO", accessor: (r) => String((r as unknown as PartNumber).po) },
    { header: "Prev. PO", accessor: (r) => String((r as unknown as PartNumber).previsaoEmissaoPO) },
    { header: "RDA", accessor: (r) => String((r as unknown as PartNumber).rda) },
    { header: "Status RDA", accessor: (r) => String((r as unknown as PartNumber).statusRDA) },
    { header: "TPO", accessor: (r) => String((r as unknown as PartNumber).tpo) },
    { header: "Status TPO", accessor: (r) => String((r as unknown as PartNumber).statusTPO) },
    { header: "Prev. TPO", accessor: (r) => String((r as unknown as PartNumber).previsaoEmissaoTPO) },
    { header: "Comentários", accessor: (r) => String((r as unknown as PartNumber).comments || "") },
  ];

  const handleExportExcel = () => {
    exportToExcel(filtered as unknown as Record<string, unknown>[], pnColumns, "part-numbers");
    toast({ title: "Exportado com sucesso", description: `${filtered.length} part numbers exportados para Excel.` });
  };

  const handleExportPDF = () => {
    exportToPDF(filtered as unknown as Record<string, unknown>[], pnColumns, "part-numbers", "Part Numbers — Relatório");
    toast({ title: "Exportado com sucesso", description: `${filtered.length} part numbers exportados para PDF.` });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseImportedFile(file);
      let packagesCreated = 0;

      const createdPkgMap = new Map<string, string>();

      const newPNs: PartNumber[] = rows.map((row, i) => {
        const pacoteName = row["Pacote"] || row["Source Package"] || "";
        let packageId: string | undefined;

        if (pacoteName.trim()) {
          const existing = pkgList.find((p) => p.sourcePackageNumber === pacoteName);
          if (existing) {
            packageId = existing.id;
          } else if (createdPkgMap.has(pacoteName)) {
            packageId = createdPkgMap.get(pacoteName);
          } else {
            const newPkgId = `pkg-auto-${Date.now()}-${i}`;
            addPackage({
              id: newPkgId,
              projectId: row["projectId"] || "proj-1",
              sourcePackageNumber: pacoteName,
              description: "Pacote criado automaticamente via importação de PNs",
              ppm: "TBD", pb: row["PB"] || row["pb"] || "TBD",
              dmDivision: "DMCA" as DmDivision, category: "SPF" as PackageCategory,
              status: "Source Package" as PackageStatus, phaseTargetStatus: "On Track" as PhaseTargetStatus,
              createdDate: new Date().toISOString().slice(0, 10), totalDays: 0,
              recommendationPredictionDate: "TBD",
            });
            createdPkgMap.set(pacoteName, newPkgId);
            packageId = newPkgId;
            packagesCreated++;
          }
        }

        return {
          id: `pn-imp-${Date.now()}-${i}`,
          projectId: row["projectId"] || "proj-1",
          packageId,
          pn: row["PN"] || row["pn"] || "TBD",
          pnEra: row["ERA"] || row["pnEra"] || "TBD",
          projeto: row["Projeto"] || row["projeto"] || "TBD",
          description: row["Descrição"] || row["description"] || "TBD",
          pb: row["PB"] || row["pb"] || "TBD",
          fornecedor: row["Fornecedor"] || row["fornecedor"] || "TBD",
          modal: (row["Modal"] || row["modal"] || "Nacional") as Modal,
          statusPO: (row["Status PO"] || row["statusPO"] || "Pendente") as StatusPO,
          po: row["PO"] || row["po"] || "",
          previsaoEmissaoPO: row["Prev. PO"] || row["previsaoEmissaoPO"] || "TBD",
          rda: row["RDA"] || row["rda"] || "",
          statusRDA: (row["Status RDA"] || row["statusRDA"] || "NA") as StatusRDA,
          tpo: row["TPO"] || row["tpo"] || "",
          statusTPO: (row["Status TPO"] || row["statusTPO"] || "NA") as StatusTPO,
          previsaoEmissaoTPO: row["Prev. TPO"] || row["previsaoEmissaoTPO"] || "",
          tko: { target: row["TKO Target"] || "TBD", done: row["TKO Done"] || undefined },
          ot: { target: row["OT Target"] || "TBD", done: row["OT Done"] || undefined },
          otop: { target: row["OTOP Target"] || "TBD", done: row["OTOP Done"] || undefined },
          comments: row["Comentários"] || row["comments"] || "",
        };
      });
      setPnList((prev) => [...prev, ...newPNs]);
      const desc = `${newPNs.length} part numbers importados${packagesCreated > 0 ? ` e ${packagesCreated} pacotes criados automaticamente` : ""}.`;
      toast({ title: "Importação concluída", description: desc });
    } catch {
      toast({ title: "Erro na importação", description: "Não foi possível ler o arquivo.", variant: "destructive" });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Part Numbers</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão de componentes, pedidos e previsões</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportExcel}>
            <FileSpreadsheet size={14} />Excel
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPDF}>
            <FileText size={14} />PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} />Importar
          </Button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" size="sm"><Plus size={16} />Novo Part Number</Button>
            </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Novo Part Number</DialogTitle></DialogHeader>
            <PNForm form={createForm} setForm={setCreateForm} />
            <DialogFooter className="gap-2">
              <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
              <Button onClick={handleCreate} disabled={!createForm.pn.trim()}>Adicionar Part Number</Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar Part Number</DialogTitle></DialogHeader>
          <PNForm form={editForm} setForm={setEditForm} />
          <DialogFooter className="gap-2">
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={handleEdit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Excluir Part Number</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Tem certeza que deseja excluir este Part Number? Esta ação não pode ser desfeita.</p>
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
            <h3 className="text-sm font-medium text-foreground">Progresso de Emissão de POs</h3>
            <span className="text-sm font-bold text-primary">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">{totalComPO} de {pnList.length} Part Numbers Finalizados com PO.</p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <div><p className="text-xs text-muted-foreground">Total PNs</p><p className="text-xl font-bold text-foreground">{pnList.length}</p></div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-success" />
            <div><p className="text-xs text-muted-foreground">Com PO</p><p className="text-xl font-bold text-success">{totalComPO}</p></div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-warning" />
            <div><p className="text-xs text-muted-foreground">Pendente</p><p className="text-xl font-bold text-warning">{totalPendente}</p></div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-info" />
            <div><p className="text-xs text-muted-foreground">In Process</p><p className="text-xl font-bold text-info">{totalInProcess}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar PN, descrição ou fornecedor..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card border-border text-foreground h-9 text-sm" />
        </div>
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger className="w-[160px] bg-card border-border h-9 text-sm"><SelectValue placeholder="Projeto" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Projetos</SelectItem>
            {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterModal} onValueChange={setFilterModal}>
          <SelectTrigger className="w-[140px] bg-card border-border h-9 text-sm"><SelectValue placeholder="Modal" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Modal</SelectItem>
            {["IRF", "Direct Buy", "Nacional"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatusPO} onValueChange={setFilterStatusPO}>
          <SelectTrigger className="w-[140px] bg-card border-border h-9 text-sm"><SelectValue placeholder="Status PO" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            {["Com PO", "Pendente", "In Process"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <p className="text-[10px] text-muted-foreground px-3 pt-2 italic">Clique com o botão direito em uma linha para editar ou excluir</p>
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-border">
                  {["PN", "ERA", "Projeto", "Descrição", "PB", "Fornecedor", "Modal", "Pacote", "TKO", "OT", "OTOP", "Status PO", "PO", "Prev. PO", "RDA", "Status RDA", "TPO", "Status TPO", "Prev. TPO", "Comentários"].map((h) => (
                    <th key={h} className="p-3 text-left text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((pn, i) => (
                  <ContextMenu key={pn.id}>
                    <ContextMenuTrigger asChild>
                      <tr className={`border-b border-border/50 hover:bg-primary/10 cursor-pointer transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                        <td className="p-3 font-medium text-foreground whitespace-nowrap">{pn.pn}</td>
                        <td className="p-3 text-muted-foreground">{pn.pnEra}</td>
                        <td className="p-3 text-muted-foreground whitespace-nowrap">{pn.projeto}</td>
                        <td className="p-3 text-muted-foreground max-w-[160px] truncate">{pn.description}</td>
                        <td className="p-3 text-muted-foreground">{pn.pb}</td>
                        <td className="p-3 text-muted-foreground whitespace-nowrap">{pn.fornecedor}</td>
                        <td className="p-3"><Badge variant="outline" className="text-[10px]">{pn.modal}</Badge></td>
                        <td className="p-3 text-muted-foreground whitespace-nowrap">{getPackageName(pn.packageId)}</td>
                        <td className="p-3 whitespace-nowrap"><DateCell field={pn.tko} /></td>
                        <td className="p-3 whitespace-nowrap"><DateCell field={pn.ot} /></td>
                        <td className="p-3 whitespace-nowrap"><DateCell field={pn.otop} /></td>
                        <td className="p-3">{statusPOBadge(pn.statusPO)}</td>
                        <td className="p-3 text-muted-foreground">{pn.po || "—"}</td>
                        <td className="p-3 text-muted-foreground whitespace-nowrap">{pn.previsaoEmissaoPO || "—"}</td>
                        <td className="p-3 text-muted-foreground">{pn.rda || "—"}</td>
                        <td className="p-3">{statusPOBadge(pn.statusRDA)}</td>
                        <td className="p-3 text-muted-foreground">{pn.tpo || "—"}</td>
                        <td className="p-3">{statusPOBadge(pn.statusTPO)}</td>
                        <td className="p-3 text-muted-foreground whitespace-nowrap">{pn.previsaoEmissaoTPO || "—"}</td>
                        <td className="p-3 text-muted-foreground max-w-[160px]">
                          {pn.comments
                            ? <span title={pn.comments} className="block truncate max-w-[140px] cursor-help">{pn.comments}</span>
                            : <span className="text-muted-foreground/40">—</span>}
                        </td>
                      </tr>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-44">
                      <ContextMenuItem className="gap-2 cursor-pointer" onClick={() => openEdit(pn)}>
                        ✏️ Editar
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem className="gap-2 cursor-pointer text-warning focus:text-warning" onClick={() => handleCancel(pn)}>
                        🚫 Cancelar
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive" onClick={() => setDeleteId(pn.id)}>
                        🗑️ Excluir
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={20} className="p-8 text-center text-muted-foreground">Nenhum part number encontrado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">{filtered.length} de {pnList.length} part numbers</p>
    </div>
  );
}
