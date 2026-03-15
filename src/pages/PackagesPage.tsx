import { useState, useMemo } from "react";
import { packages as initialPackages, projects } from "@/data/mockData";
import { Package, PackageStatus, PhaseTargetStatus, DmDivision, PackageCategory } from "@/data/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { formatDate, calculateWeeks, calculatePredictionWeeks, getDateStatus } from "@/lib/dateUtils";
import type { DateField } from "@/data/types";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";

function DateCell({ field }: { field: DateField }) {
  const status = getDateStatus(field);
  const dateStr = field.done || field.target;
  const colorClass =
    status === "done" ? "text-success" :
    status === "late" ? "text-destructive" :
    "text-muted-foreground";
  return <span className={`text-xs font-medium ${colorClass}`}>{formatDate(dateStr)}</span>;
}

const emptyForm = {
  projectId: "",
  sourcePackageNumber: "",
  description: "",
  ppm: "",
  pb: "",
  dmDivision: "DMCA" as DmDivision,
  category: "SPF" as PackageCategory,
  status: "Source Package" as PackageStatus,
  phaseTargetStatus: "On Track" as PhaseTargetStatus,
  createdDate: "",
  totalDays: "",
  recommendationPredictionDate: "",
  tkoTarget: "", tkoDone: "",
  otTarget: "", otDone: "",
  otopTarget: "", otopDone: "",
};

export default function PackagesPage() {
  const [pkgList, setPkgList] = useState<Package[]>(initialPackages);
  const [search, setSearch] = useState("");
  const [filterDM, setFilterDM] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

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
    const cls =
      status === "On Track" ? "bg-success text-success-foreground" :
      status === "At Risk" ? "bg-warning text-warning-foreground" :
      "bg-destructive text-destructive-foreground";
    return <Badge className={`text-[10px] ${cls}`}>{status}</Badge>;
  };

  const totalClosed = pkgList.filter((pkg) => pkg.status === "Closed").length;
  const progressPercentage = pkgList.length > 0
    ? Math.round((totalClosed / pkgList.length) * 100)
    : 0;

  const field = (key: keyof typeof form, label: string, placeholder = "TBD") => (
    <div>
      <label className="text-sm font-medium text-foreground mb-1 block">{label}</label>
      <Input
        placeholder={placeholder}
        value={form[key] as string}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="bg-card border-border"
      />
    </div>
  );

  const handleSubmit = () => {
    const newPkg: Package = {
      id: `pkg-${Date.now()}`,
      projectId: form.projectId || "proj-1",
      sourcePackageNumber: form.sourcePackageNumber || "TBD",
      description: form.description || "TBD",
      ppm: form.ppm || "TBD",
      pb: form.pb || "TBD",
      dmDivision: form.dmDivision,
      category: form.category,
      status: form.status,
      phaseTargetStatus: form.phaseTargetStatus,
      createdDate: form.createdDate || new Date().toISOString().slice(0, 10),
      totalDays: Number(form.totalDays) || 0,
      recommendationPredictionDate: form.recommendationPredictionDate || "TBD",
      tko: { target: form.tkoTarget || "TBD", done: form.tkoDone || undefined },
      ot: { target: form.otTarget || "TBD", done: form.otDone || undefined },
      otop: { target: form.otopTarget || "TBD", done: form.otopDone || undefined },
    };
    setPkgList((prev) => [...prev, newPkg]);
    setForm(emptyForm);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacotes</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão e acompanhamento de source packages</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} />
              Novo Pacote
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Pacote</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Projeto</label>
                <Select value={form.projectId} onValueChange={(v) => setForm((f) => ({ ...f, projectId: v }))}>
                  <SelectTrigger className="bg-card border-border"><SelectValue placeholder="Selecione o projeto" /></SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {field("sourcePackageNumber", "Source Package Number")}
              {field("description", "Descrição")}
              {field("ppm", "PPM")}
              {field("pb", "PB")}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">DM Division</label>
                <Select value={form.dmDivision} onValueChange={(v) => setForm((f) => ({ ...f, dmDivision: v as DmDivision }))}>
                  <SelectTrigger className="bg-card border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["DMCA", "DMPT", "DMEM", "DMBI"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Categoria</label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v as PackageCategory }))}>
                  <SelectTrigger className="bg-card border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["SPF", "TH", "PWT", "MO"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Status</label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as PackageStatus }))}>
                  <SelectTrigger className="bg-card border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Source Package", "Pre-RFQ", "RFQ", "Offer Review", "Negotiation", "Summary", "Recommendation", "Closed"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Target Status</label>
                <Select value={form.phaseTargetStatus} onValueChange={(v) => setForm((f) => ({ ...f, phaseTargetStatus: v as PhaseTargetStatus }))}>
                  <SelectTrigger className="bg-card border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["On Track", "At Risk", "Late"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {field("createdDate", "Data de Criação (AAAA-MM-DD)", "2025-01-01")}
              {field("totalDays", "Total de Dias", "90")}
              {field("recommendationPredictionDate", "Previsão Recommendation (AAAA-MM-DD)", "2025-12-01")}
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide pt-1">TKO</p>
              {field("tkoTarget", "TKO - Target (AAAA-MM-DD)")}
              {field("tkoDone", "TKO - Done (AAAA-MM-DD)")}
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide pt-1">OT</p>
              {field("otTarget", "OT - Target (AAAA-MM-DD)")}
              {field("otDone", "OT - Done (AAAA-MM-DD)")}
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide pt-1">OTOP</p>
              {field("otopTarget", "OTOP - Target (AAAA-MM-DD)")}
              {field("otopDone", "OTOP - Done (AAAA-MM-DD)")}
            </div>
            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleSubmit}>Adicionar Pacote</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-foreground">Progresso de Fechamento de Pacotes</h3>
            <span className="text-sm font-bold text-primary">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {totalClosed} de {pkgList.length} Pacotes Fechados.
          </p>
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
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-border">
                  {["Source Package", "Descrição", "PPM", "PB", "DM Div.", "Cat.", "Status", "Target Status", "Sem. Total", "Sem. Previsão", "Data Previsão", "TKO", "OT", "OTOP"].map((h) => (
                    <th key={h} className="p-3 text-left text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((pkg, i) => (
                  <tr key={pkg.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
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
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={14} className="p-8 text-center text-muted-foreground">Nenhum pacote encontrado</td></tr>
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
