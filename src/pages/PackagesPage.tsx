import { useState, useMemo } from "react";
import { packages, projects } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { formatDate, calculateWeeks, calculatePredictionWeeks, getDateStatus } from "@/lib/dateUtils";
import type { DateField } from "@/data/types";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

function DateCell({ field }: { field: DateField }) {
  const status = getDateStatus(field);
  const dateStr = field.done || field.target;
  const colorClass =
    status === "done" ? "text-success" :
    status === "late" ? "text-destructive" :
    "text-muted-foreground";
  return <span className={`text-xs font-medium ${colorClass}`}>{formatDate(dateStr)}</span>;
}

export default function PackagesPage() {
  const [search, setSearch] = useState("");
  const [filterDM, setFilterDM] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const filtered = useMemo(() => {
    return packages.filter((pkg) => {
      const matchSearch = search === "" || 
        pkg.sourcePackageNumber.toLowerCase().includes(search.toLowerCase()) ||
        pkg.description.toLowerCase().includes(search.toLowerCase());
      const matchDM = filterDM === "all" || pkg.dmDivision === filterDM;
      const matchStatus = filterStatus === "all" || pkg.status === filterStatus;
      const matchProject = filterProject === "all" || pkg.projectId === filterProject;
      const matchCategory = filterCategory === "all" || pkg.category === filterCategory;
      return matchSearch && matchDM && matchStatus && matchProject && matchCategory;
    });
  }, [search, filterDM, filterStatus, filterProject, filterCategory]);

  const targetBadge = (status: string) => {
    const cls =
      status === "On Track" ? "bg-success text-success-foreground" :
      status === "At Risk" ? "bg-warning text-warning-foreground" :
      "bg-destructive text-destructive-foreground";
    return <Badge className={`text-[10px] ${cls}`}>{status}</Badge>;
  };

  const totalClosed = packages.filter((pkg) => pkg.status === "Closed").length;
  const progressPercentage = packages.length > 0 
    ? Math.round((totalClosed / packages.length) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacotes</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão e acompanhamento de source packages</p>
        </div>
        <Button className="gap-2">
          <Plus size={16} />
          Novo Pacote
        </Button>
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
            {totalClosed} de {packages.length} Pacotes Fechados.
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
      <p className="text-xs text-muted-foreground">{filtered.length} de {packages.length} pacotes</p>
    </div>
  );
}
