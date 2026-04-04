import { useState, useMemo, useRef } from "react";
import { projects } from "@/data/mockData";
import { useData } from "@/contexts/DataContext";
import { useCancelled } from "@/contexts/CancelledContext";
import { Package, PackageStatus, PhaseTargetStatus, DmDivision, PackageCategory, Modal, PartNumber, StatusPO, StatusRDA, StatusTPO } from "@/data/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, CheckCircle2, AlertTriangle, XCircle, FileSpreadsheet, FileText, Upload, Trash2 } from "lucide-react";
import { formatDate, calculateWeeks, calculatePredictionWeeks } from "@/lib/dateUtils";
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

const blankForm = {
  projectId: "", sourcePackageNumber: "", description: "", ppm: "", pb: "",
  dmDivision: "DMCA" as DmDivision, category: "SPF" as PackageCategory,
  status: "Source Package" as PackageStatus, phaseTargetStatus: "On Track" as PhaseTargetStatus,
  createdDate: "", totalDays: "", recommendationPredictionDate: "",
  comments: "",
};

type FormState = typeof blankForm;

interface InlinePNForm {
  pn: string;
  pnEra: string;
  description: string;
  fornecedor: string;
  modal: Modal;
}

const blankInlinePN: InlinePNForm = { pn: "", pnEra: "", description: "", fornecedor: "", modal: "Nacional" };

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

function InlinePNSection({ pnRows, setPnRows }: { pnRows: InlinePNForm[]; setPnRows: React.Dispatch<React.SetStateAction<InlinePNForm[]>> }) {
  const addRow = () => setPnRows((prev) => [...prev, { ...blankInlinePN }]);
  const removeRow = (idx: number) => setPnRows((prev) => prev.filter((_, i) => i !== idx));
  const updateRow = (idx: number, key: keyof InlinePNForm, value: string) =>
    setPnRows((prev) => prev.map((r, i) => i === idx ? { ...r, [key]: value } : r));

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Part Numbers (opcional)</p>
        <Button type="button" variant="outline" size="sm" className="gap-1 text-xs h-7" onClick={addRow}>
          <Plus size={12} />Adicionar PN
        </Button>
      </div>
      {pnRows.map((row, idx) => (
        <div key={idx} className="grid grid-cols-[1fr_1fr_1.5fr_1.5fr_auto_auto] gap-2 items-end border border-border/50 rounded-md p-2 bg-muted/20">
          <div>
            <label className="text-[10px] text-muted-foreground">PN *</label>
            <Input placeholder="PN-XXX" value={row.pn} onChange={(e) => updateRow(idx, "pn", e.target.value)} className="bg-card border-border h-8 text-xs" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">ERA</label>
            <Input placeholder="ERA-01" value={row.pnEra} onChange={(e) => updateRow(idx, "pnEra", e.target.value)} className="bg-card border-border h-8 text-xs" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Descrição</label>
            <Input placeholder="Descrição" value={row.description} onChange={(e) => updateRow(idx, "description", e.target.value)} className="bg-card border-border h-8 text-xs" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Fornecedor</label>
            <Input placeholder="Fornecedor" value={row.fornecedor} onChange={(e) => updateRow(idx, "fornecedor", e.target.value)} className="bg-card border-border h-8 text-xs" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Modal</label>
            <Select value={row.modal} onValueChange={(v) => updateRow(idx, "modal", v)}>
              <SelectTrigger className="bg-card border-border h-8 text-xs w-[100px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["IRF", "Direct Buy", "Nacional"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removeRow(idx)}>
            <Trash2 size={14} />
          </Button>
        </div>
      ))}
      {pnRows.length === 0 && (
        <p className="text-xs text-muted-foreground/60 italic text-center py-2">Nenhum Part Number adicionado. Clique em "Adicionar PN" para vincular PNs a este pacote.</p>
      )}
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
    comments: form.comments || "",
  };
}

export default function PackagesPage() {
  const { pkgList, setPkgList, pnList, addPackage, addPartNumbers } = useData();
  const [search, setSearch] = useState("");
  const [filterDM, setFilterDM] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const { cancelPackage } = useCancelled();

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(blankForm);
  const [createPNRows, setCreatePNRows] = useState<InlinePNForm[]>([]);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<FormState>(blankForm);
  const [editId, setEditId] = useState<string | null>(null);

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

  const predictionStatusBadge = (pkg: Package) => {
    const weeks = calculatePredictionWeeks(pkg.createdDate, pkg.recommendationPredictionDate);
    if (weeks <= 24) return <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30">Achieving Target</Badge>;
    if (weeks <= 26) return <Badge className="text-[10px] bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30">Approaching Target</Badge>;
    return <Badge className="text-[10px] bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30">Over Target</Badge>;
  };

  const predictionStatusText = (pkg: Package) => {
    const weeks = calculatePredictionWeeks(pkg.createdDate, pkg.recommendationPredictionDate);
    if (weeks <= 24) return "Achieving Target";
    if (weeks <= 26) return "Approaching Target";
    return "Over Target";
  };

  const targetBadge = (status: string) => {
    if (status === "On Track") return <span className="flex items-center gap-1 text-xs font-medium text-success"><CheckCircle2 size={13} />On Track</span>;
    if (status === "At Risk")  return <span className="flex items-center gap-1 text-xs font-medium text-warning"><AlertTriangle size={13} />At Risk</span>;
    return <span className="flex items-center gap-1 text-xs font-medium text-destructive"><XCircle size={13} />Late</span>;
  };

  const totalClosed = pkgList.filter((p) => p.status === "Closed").length;
  const progressPercentage = pkgList.length > 0 ? Math.round((totalClosed / pkgList.length) * 100) : 0;

  const handleCreate = () => {
    const pkgId = `pkg-${Date.now()}`;
    const newPkg = formToPkg(createForm, pkgId);
    addPackage(newPkg);

    const validPNs = createPNRows.filter((r) => r.pn.trim());
    if (validPNs.length > 0) {
      const proj = projects.find((p) => p.id === createForm.projectId);
      const newPNs: PartNumber[] = validPNs.map((row, i) => ({
        id: `pn-${Date.now()}-${i}`,
        packageId: pkgId,
        projectId: createForm.projectId || "proj-1",
        pn: row.pn,
        pnEra: row.pnEra || "TBD",
        projeto: proj?.name || "TBD",
        description: row.description || "TBD",
        pb: createForm.pb || "TBD",
        fornecedor: row.fornecedor || "TBD",
        modal: row.modal as Modal,
        statusPO: "Pendente",
        po: "",
        previsaoEmissaoPO: "",
        rda: "",
        statusRDA: "NA",
        tpo: "",
        statusTPO: "NA",
        previsaoEmissaoTPO: "",
        tko: { target: "TBD" },
        ot: { target: "TBD" },
        otop: { target: "TBD" },
      }));
      addPartNumbers(newPNs);
    }

    setCreateForm(blankForm);
    setCreatePNRows([]);
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

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const buildExplodedRows = (list: Package[]) => {
    const rows: Record<string, unknown>[] = [];
    for (const pkg of list) {
      const linkedPNs = pnList.filter((pn) => pn.packageId === pkg.id);
      if (linkedPNs.length === 0) {
        rows.push({ ...pkg, _pn: "", _pnEra: "", _pnDesc: "", _fornecedor: "", _modal: "", _statusPO: "", _po: "" });
      } else {
        for (const pn of linkedPNs) {
          rows.push({ ...pkg, _pn: pn.pn, _pnEra: pn.pnEra, _pnDesc: pn.description, _fornecedor: pn.fornecedor, _modal: pn.modal, _statusPO: pn.statusPO, _po: pn.po });
        }
      }
    }
    return rows;
  };

  const pkgColumns: ExportColumn[] = [
    { header: "Source Package", accessor: (r) => String((r as unknown as Package).sourcePackageNumber) },
    { header: "Descrição", accessor: (r) => String((r as unknown as Package).description) },
    { header: "PPM", accessor: (r) => String((r as unknown as Package).ppm) },
    { header: "PB", accessor: (r) => String((r as unknown as Package).pb) },
    { header: "DM Div.", accessor: (r) => String((r as unknown as Package).dmDivision) },
    { header: "Categoria", accessor: (r) => String((r as unknown as Package).category) },
    { header: "Status", accessor: (r) => String((r as unknown as Package).status) },
    { header: "Target Status", accessor: (r) => String((r as unknown as Package).phaseTargetStatus) },
    { header: "Total Dias", accessor: (r) => String((r as unknown as Package).totalDays) },
    { header: "Status Previsão", accessor: (r) => predictionStatusText(r as unknown as Package) },
    { header: "Data Previsão", accessor: (r) => String((r as unknown as Package).recommendationPredictionDate) },
    { header: "Comentários", accessor: (r) => String((r as unknown as Package).comments || "") },
    { header: "PN", accessor: (r) => String((r as Record<string, unknown>)._pn || "") },
    { header: "ERA", accessor: (r) => String((r as Record<string, unknown>)._pnEra || "") },
    { header: "Descrição PN", accessor: (r) => String((r as Record<string, unknown>)._pnDesc || "") },
    { header: "Fornecedor", accessor: (r) => String((r as Record<string, unknown>)._fornecedor || "") },
    { header: "Modal", accessor: (r) => String((r as Record<string, unknown>)._modal || "") },
    { header: "Status PO", accessor: (r) => String((r as Record<string, unknown>)._statusPO || "") },
    { header: "PO", accessor: (r) => String((r as Record<string, unknown>)._po || "") },
  ];

  const handleExportExcel = () => {
    const exploded = buildExplodedRows(filtered);
    exportToExcel(exploded, pkgColumns, "pacotes");
    toast({ title: "Exportado com sucesso", description: `${filtered.length} pacotes exportados para Excel.` });
  };

  const handleExportPDF = () => {
    const exploded = buildExplodedRows(filtered);
    exportToPDF(exploded, pkgColumns, "pacotes", "Pacotes — Relatório");
    toast({ title: "Exportado com sucesso", description: `${filtered.length} pacotes exportados para PDF.` });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseImportedFile(file);

      const grouped = new Map<string, { pkgRow: Record<string, string>; pnRows: Record<string, string>[] }>();
      for (const row of rows) {
        const spn = row["Source Package"] || row["sourcePackageNumber"] || "TBD";
        if (!grouped.has(spn)) {
          grouped.set(spn, { pkgRow: row, pnRows: [] });
        }
        const pnValue = row["PN"] || row["pn"] || "";
        if (pnValue.trim()) {
          grouped.get(spn)!.pnRows.push(row);
        }
      }

      const newPkgs: Package[] = [];
      const newPNs: PartNumber[] = [];
      let pkgIdx = 0;

      for (const [, { pkgRow, pnRows }] of grouped) {
        const pkgId = `pkg-imp-${Date.now()}-${pkgIdx++}`;
        newPkgs.push({
          id: pkgId,
          projectId: pkgRow["projectId"] || "proj-1",
          sourcePackageNumber: pkgRow["Source Package"] || pkgRow["sourcePackageNumber"] || "TBD",
          description: pkgRow["Descrição"] || pkgRow["description"] || "TBD",
          ppm: pkgRow["PPM"] || pkgRow["ppm"] || "TBD",
          pb: pkgRow["PB"] || pkgRow["pb"] || "TBD",
          dmDivision: (pkgRow["DM Div."] || pkgRow["dmDivision"] || "DMCA") as DmDivision,
          category: (pkgRow["Categoria"] || pkgRow["category"] || "SPF") as PackageCategory,
          status: (pkgRow["Status"] || pkgRow["status"] || "Source Package") as PackageStatus,
          phaseTargetStatus: (pkgRow["Target Status"] || pkgRow["phaseTargetStatus"] || "On Track") as PhaseTargetStatus,
          createdDate: pkgRow["createdDate"] || new Date().toISOString().slice(0, 10),
          totalDays: Number(pkgRow["Total Dias"] || pkgRow["totalDays"]) || 0,
          recommendationPredictionDate: pkgRow["Data Previsão"] || pkgRow["recommendationPredictionDate"] || "TBD",
          comments: pkgRow["Comentários"] || pkgRow["comments"] || "",
        });

        for (let j = 0; j < pnRows.length; j++) {
          const r = pnRows[j];
          newPNs.push({
            id: `pn-imp-${Date.now()}-${pkgIdx}-${j}`,
            packageId: pkgId,
            projectId: pkgRow["projectId"] || "proj-1",
            pn: r["PN"] || r["pn"] || "TBD",
            pnEra: r["ERA"] || r["pnEra"] || "TBD",
            projeto: r["Projeto"] || r["projeto"] || "TBD",
            description: r["Descrição PN"] || r["description"] || "TBD",
            pb: pkgRow["PB"] || pkgRow["pb"] || "TBD",
            fornecedor: r["Fornecedor"] || r["fornecedor"] || "TBD",
            modal: (r["Modal"] || r["modal"] || "Nacional") as Modal,
            statusPO: (r["Status PO"] || r["statusPO"] || "Pendente") as StatusPO,
            po: r["PO"] || r["po"] || "",
            previsaoEmissaoPO: r["Prev. PO"] || r["previsaoEmissaoPO"] || "TBD",
            rda: r["RDA"] || r["rda"] || "",
            statusRDA: (r["Status RDA"] || r["statusRDA"] || "NA") as StatusRDA,
            tpo: r["TPO"] || r["tpo"] || "",
            statusTPO: (r["Status TPO"] || r["statusTPO"] || "NA") as StatusTPO,
            previsaoEmissaoTPO: r["Prev. TPO"] || r["previsaoEmissaoTPO"] || "",
            comments: r["Comentários"] || r["comments"] || "",
            tko: { target: r["TKO Target"] || "TBD", done: r["TKO Done"] || undefined },
            ot: { target: r["OT Target"] || "TBD", done: r["OT Done"] || undefined },
            otop: { target: r["OTOP Target"] || "TBD", done: r["OTOP Done"] || undefined },
          });
        }
      }

      setPkgList((prev) => [...prev, ...newPkgs]);
      if (newPNs.length > 0) addPartNumbers(newPNs);
      toast({ title: "Importação concluída", description: `${newPkgs.length} pacotes${newPNs.length > 0 ? ` e ${newPNs.length} part numbers` : ""} importados.` });
    } catch {
      toast({ title: "Erro na importação", description: "Não foi possível ler o arquivo.", variant: "destructive" });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacotes</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão e acompanhamento de source packages</p>
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
          <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) { setCreatePNRows([]); setCreateForm(blankForm); } }}>
            <DialogTrigger asChild>
              <Button className="gap-2" size="sm"><Plus size={16} />Novo Pacote</Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Novo Pacote</DialogTitle></DialogHeader>
            <PkgForm form={createForm} setForm={setCreateForm} />
            <InlinePNSection pnRows={createPNRows} setPnRows={setCreatePNRows} />
            <DialogFooter className="gap-2">
              <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
              <Button onClick={handleCreate}>Adicionar Pacote</Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        </div>
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
                  {["Source Package", "Descrição", "PPM", "PB", "DM Div.", "Cat.", "Status", "Target Status", "Sem. Total", "Status Previsão", "Sem. Previsão", "Data Previsão", "Comentários"].map((h) => (
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
                        <td className="p-3">{predictionStatusBadge(pkg)}</td>
                        <td className="p-3 text-muted-foreground">{calculatePredictionWeeks(pkg.createdDate, pkg.recommendationPredictionDate)}</td>
                        <td className="p-3 text-muted-foreground whitespace-nowrap">{formatDate(pkg.recommendationPredictionDate)}</td>
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
                      <ContextMenuItem className="gap-2 cursor-pointer text-warning focus:text-warning" onClick={() => handleCancel(pkg)}>
                        🚫 Cancelar
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive" onClick={() => setDeleteId(pkg.id)}>
                        🗑️ Excluir
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={13} className="p-8 text-center text-muted-foreground">Nenhum pacote encontrado</td></tr>
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
