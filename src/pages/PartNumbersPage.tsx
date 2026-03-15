import { useState, useMemo } from "react";
import { partNumbers, projects } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShoppingCart, Clock, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
const statusPOBadge = (status: string) => {
  const cls =
    status === "Com PO" ? "bg-success text-success-foreground" :
    status === "Pendente" ? "bg-warning text-warning-foreground" :
    status === "In Process" ? "bg-info text-info-foreground" :
    "bg-muted text-muted-foreground";
  return <Badge className={`text-[10px] ${cls}`}>{status}</Badge>;
};

export default function PartNumbersPage() {
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [filterModal, setFilterModal] = useState("all");
  const [filterStatusPO, setFilterStatusPO] = useState("all");

  const filtered = useMemo(() => {
    return partNumbers.filter((pn) => {
      const matchSearch = search === "" ||
        pn.pn.toLowerCase().includes(search.toLowerCase()) ||
        pn.description.toLowerCase().includes(search.toLowerCase()) ||
        pn.fornecedor.toLowerCase().includes(search.toLowerCase());
      const matchProject = filterProject === "all" || pn.projectId === filterProject;
      const matchModal = filterModal === "all" || pn.modal === filterModal;
      const matchStatus = filterStatusPO === "all" || pn.statusPO === filterStatusPO;
      return matchSearch && matchProject && matchModal && matchStatus;
    });
  }, [search, filterProject, filterModal, filterStatusPO]);

  const totalComPO = partNumbers.filter((p) => p.statusPO === "Com PO").length;
  const totalPendente = partNumbers.filter((p) => p.statusPO === "Pendente").length;
  const totalInProcess = partNumbers.filter((p) => p.statusPO === "In Process").length;

  const progressPercentage = partNumbers.length > 0 
    ? Math.round((totalComPO / partNumbers.length) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Part Numbers</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestão de componentes, pedidos e previsões</p>
      </div>

      {/* Progress */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-foreground">Progresso de Emissão de POs</h3>
            <span className="text-sm font-bold text-primary">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {totalComPO} de {partNumbers.length} Part Numbers Finalizados com PO.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Total PNs</p>
              <p className="text-xl font-bold text-foreground">{partNumbers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-success" />
            <div>
              <p className="text-xs text-muted-foreground">Com PO</p>
              <p className="text-xl font-bold text-success">{totalComPO}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-warning" />
            <div>
              <p className="text-xs text-muted-foreground">Pendente</p>
              <p className="text-xl font-bold text-warning">{totalPendente}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-info" />
            <div>
              <p className="text-xs text-muted-foreground">In Process</p>
              <p className="text-xl font-bold text-info">{totalInProcess}</p>
            </div>
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
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-border">
                  {["PN", "ERA", "Projeto", "Descrição", "PB", "Fornecedor", "Modal", "Status PO", "PO", "Prev. PO", "RDA", "Status RDA", "TPO", "Status TPO", "Prev. TPO"].map((h) => (
                    <th key={h} className="p-3 text-left text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((pn, i) => (
                  <tr key={pn.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                    <td className="p-3 font-medium text-foreground whitespace-nowrap">{pn.pn}</td>
                    <td className="p-3 text-muted-foreground">{pn.pnEra}</td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">{pn.projeto}</td>
                    <td className="p-3 text-muted-foreground max-w-[160px] truncate">{pn.description}</td>
                    <td className="p-3 text-muted-foreground">{pn.pb}</td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">{pn.fornecedor}</td>
                    <td className="p-3"><Badge variant="outline" className="text-[10px]">{pn.modal}</Badge></td>
                    <td className="p-3">{statusPOBadge(pn.statusPO)}</td>
                    <td className="p-3 text-muted-foreground">{pn.po || "—"}</td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">{pn.previsaoEmissaoPO || "—"}</td>
                    <td className="p-3 text-muted-foreground">{pn.rda || "—"}</td>
                    <td className="p-3">{statusPOBadge(pn.statusRDA)}</td>
                    <td className="p-3 text-muted-foreground">{pn.tpo || "—"}</td>
                    <td className="p-3">{statusPOBadge(pn.statusTPO)}</td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">{pn.previsaoEmissaoTPO || "—"}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={15} className="p-8 text-center text-muted-foreground">Nenhum part number encontrado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">{filtered.length} de {partNumbers.length} part numbers</p>
    </div>
  );
}
