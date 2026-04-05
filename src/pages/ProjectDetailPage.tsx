import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projects } from "@/data/mockData";
import { useData } from "@/contexts/DataContext";
import { Package, PartNumber } from "@/data/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend, LabelList,
} from "recharts";
import { calculatePredictionWeeks } from "@/lib/dateUtils";

type ModalData = {
  title: string;
  type: "packages" | "pns";
  items: Package[] | PartNumber[];
} | null;

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pkgList, pnList } = useData();
  const [modalData, setModalData] = useState<ModalData>(null);

  const project = projects.find((p) => p.id === id);
  const projPackages = pkgList.filter((p) => p.projectId === id);
  const projPNs = pnList.filter((p) => p.projectId === id);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Projeto não encontrado</p>
      </div>
    );
  }

  // ── Dashboard 1: Commodity by DM Division ──
  const dmPhaseData = ["DMCA", "DMPT", "DMEM", "DMBI"].map((dm) => ({
    division: dm,
    count: projPackages.filter((p) => p.dmDivision === dm).length,
  })).filter((d) => d.count > 0);

  // ── Dashboard 2: Prediction Target ──
  const predictionCounts = { achievingTarget: 0, approachingTarget: 0, overTarget: 0 };
  projPackages.forEach((pkg) => {
    const weeks = calculatePredictionWeeks(pkg.createdDate, pkg.recommendationPredictionDate);
    if (weeks <= 24) predictionCounts.achievingTarget++;
    else if (weeks <= 26) predictionCounts.approachingTarget++;
    else predictionCounts.overTarget++;
  });
  const predictionData = [
    { name: "Achieving Target", value: predictionCounts.achievingTarget, color: "#10B981" },
    { name: "Approaching Target", value: predictionCounts.approachingTarget, color: "#F59E0B" },
    { name: "Over Target", value: predictionCounts.overTarget, color: "#E11D48" },
  ].filter((d) => d.value > 0);

  // ── Dashboard 3: Current Phase Target ──
  const phases = ["Source Package", "Pre-RFQ", "RFQ", "Offer Review", "Negotiation", "Summary", "Recommendation", "Closed"];
  const phaseLabelMap: Record<string, string> = {};
  const phaseTargetData = phases
    .map((phase) => {
      const pkgsInPhase = projPackages.filter((p) => p.status === phase);
      const label = phase.length > 9 ? phase.slice(0, 9) + "…" : phase;
      phaseLabelMap[label] = phase;
      if (phase === "Closed") {
        const latePkgs = pkgsInPhase.filter((p) => p.phaseTargetStatus === "Late").length;
        const onTrackPkgs = pkgsInPhase.length - latePkgs;
        return { phase: label, "On Track": onTrackPkgs, "At Risk": 0, Late: latePkgs, Closed: 0 };
      }
      return {
        phase: label,
        "On Track": pkgsInPhase.filter((p) => p.phaseTargetStatus === "On Track").length,
        "At Risk": pkgsInPhase.filter((p) => p.phaseTargetStatus === "At Risk").length,
        Late: pkgsInPhase.filter((p) => p.phaseTargetStatus === "Late").length,
        Closed: 0,
      };
    })
    .filter((d) => d["On Track"] + d["At Risk"] + d.Late + d.Closed > 0);

  // ── Dashboard 4: Status PO ──
  const poData = [
    { name: "Com PO", value: projPNs.filter((p) => p.statusPO === "Com PO").length, color: "#10B981" },
    { name: "Pendente", value: projPNs.filter((p) => p.statusPO === "Pendente").length, color: "#F59E0B" },
    { name: "In Process", value: projPNs.filter((p) => p.statusPO === "In Process").length, color: "#3B82F6" },
  ].filter((d) => d.value > 0);

  // ── Dashboard 5: Monthly Closing Prediction ──
  const monthMap: Record<string, number> = {};
  projPackages.forEach((pkg) => {
    const date = pkg.recommendationPredictionDate;
    if (!date || date === "TBD") return;
    const parts = date.split("-");
    if (parts.length < 2) return;
    const key = `${parts[0]}-${parts[1]}`;
    monthMap[key] = (monthMap[key] || 0) + 1;
  });
  const monthlyLabelToKey: Record<string, string> = {};
  const monthlyData = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => {
      const [y, m] = month.split("-");
      const label = new Date(Number(y), Number(m) - 1).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
      monthlyLabelToKey[label] = month;
      return { month: label, pacotes: count };
    });

  const tooltipStyle = {
    contentStyle: {
      background: "hsl(222 47% 8%)",
      border: "1px solid hsl(217 33% 20%)",
      borderRadius: 8,
      color: "hsl(210 40% 96%)",
    },
  };

  const getPackageName = (packageId?: string) => {
    if (!packageId) return "—";
    const pkg = pkgList.find((p) => p.id === packageId);
    return pkg?.sourcePackageNumber || "—";
  };

  // ── Click handlers ──
  const handleDmClick = (data: any) => {
    if (!data?.activePayload?.[0]) return;
    const dm = data.activePayload[0].payload.division;
    const items = projPackages.filter((p) => p.dmDivision === dm);
    if (items.length) setModalData({ title: `Pacotes - ${dm}`, type: "packages", items });
  };

  const handlePredictionClick = (_: any, index: number) => {
    const entry = predictionData[index];
    if (!entry) return;
    const items = projPackages.filter((pkg) => {
      const weeks = calculatePredictionWeeks(pkg.createdDate, pkg.recommendationPredictionDate);
      if (entry.name === "Achieving Target") return weeks <= 24;
      if (entry.name === "Approaching Target") return weeks > 24 && weeks <= 26;
      return weeks > 26;
    });
    if (items.length) setModalData({ title: `Pacotes - ${entry.name}`, type: "packages", items });
  };

  const handlePhaseClick = (data: any) => {
    if (!data?.activePayload?.length) return;
    const phaseLabel = data.activeLabel as string;
    const fullPhase = phaseLabelMap[phaseLabel] || phaseLabel;
    const items = projPackages.filter((p) => p.status === fullPhase);
    if (items.length) setModalData({ title: `Pacotes - ${fullPhase}`, type: "packages", items });
  };

  const handlePoClick = (_: any, index: number) => {
    const entry = poData[index];
    if (!entry) return;
    const items = projPNs.filter((p) => p.statusPO === entry.name);
    if (items.length) setModalData({ title: `Part Numbers - ${entry.name}`, type: "pns", items });
  };

  const handleMonthlyClick = (data: any) => {
    if (!data?.activePayload?.[0]) return;
    const label = data.activeLabel as string;
    const key = monthlyLabelToKey[label];
    if (!key) return;
    const items = projPackages.filter((pkg) => {
      const date = pkg.recommendationPredictionDate;
      if (!date || date === "TBD") return false;
      const parts = date.split("-");
      if (parts.length < 2) return false;
      const k = `${parts[0]}-${parts[1]}`;
      return k === key;
    });
    if (items.length) setModalData({ title: `Pacotes - ${label}`, type: "packages", items });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          <p className="text-sm text-muted-foreground">{project.description}</p>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-muted">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="packages">Pacotes ({projPackages.length})</TabsTrigger>
          <TabsTrigger value="pns">Part Numbers ({projPNs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* KPIs row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total Pacotes</p>
                <p className="text-2xl font-bold text-foreground">{projPackages.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total PNs</p>
                <p className="text-2xl font-bold text-foreground">{projPNs.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Progresso</p>
                <p className="text-2xl font-bold text-primary">{project.progress}%</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge className="mt-1">{project.status}</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 1. DM Division */}
            <Card className="bg-card border-border cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Commodity by Phase (DM Division)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dmPhaseData} onClick={handleDmClick}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20%)" />
                    <XAxis dataKey="division" tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }} />
                    <YAxis tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} allowDecimals={false} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="count" fill="hsl(160 84% 39%)" radius={[4, 4, 0, 0]} className="cursor-pointer">
                      <LabelList dataKey="count" position="top" style={{ fill: "hsl(210 40% 96%)", fontSize: 12, fontWeight: 600 }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 2. Prediction Target */}
            <Card className="bg-card border-border cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Prediction Target (&lt;24 sem / 24–26 / &gt;26)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={predictionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                      onClick={handlePredictionClick}
                      className="cursor-pointer"
                    >
                      {predictionData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                    <Legend wrapperStyle={{ color: "hsl(215 20% 55%)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 3. Current Phase Target */}
            <Card className="bg-card border-border cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Current Phase Target</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={phaseTargetData} onClick={handlePhaseClick}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20%)" />
                    <XAxis dataKey="phase" tick={{ fill: "hsl(215 20% 55%)", fontSize: 10 }} />
                    <YAxis tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} allowDecimals={false} />
                    <Tooltip {...tooltipStyle} />
                    <Legend wrapperStyle={{ color: "hsl(215 20% 55%)", fontSize: 11 }} />
                    <Bar dataKey="On Track" stackId="a" fill="#10B981" className="cursor-pointer" />
                    <Bar dataKey="At Risk" stackId="a" fill="#F59E0B" className="cursor-pointer" />
                    <Bar dataKey="Late" stackId="a" fill="#E11D48" className="cursor-pointer" />
                    <Bar dataKey="Closed" stackId="a" fill="#8B5CF6" radius={[4, 4, 0, 0]} className="cursor-pointer" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 4. Status PO */}
            <Card className="bg-card border-border cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Status PO - Part Numbers</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={poData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      onClick={handlePoClick}
                      className="cursor-pointer"
                    >
                      {poData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                    <Legend wrapperStyle={{ color: "hsl(215 20% 55%)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* 5. Monthly Closing Prediction */}
          <Card className="bg-card border-border cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Previsão de Fechamento por Mês (Data Previsão)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Sem dados de previsão disponíveis</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={monthlyData} onClick={handleMonthlyClick}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(160 84% 39%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(160 84% 39%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20%)" />
                    <XAxis dataKey="month" tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} allowDecimals={false} />
                    <Tooltip {...tooltipStyle} />
                    <Area
                      type="monotone"
                      dataKey="pacotes"
                      stroke="hsl(160 84% 39%)"
                      strokeWidth={2}
                      fill="url(#areaGradient)"
                      dot={{ fill: "hsl(160 84% 39%)", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6 }}
                      className="cursor-pointer"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packages" className="mt-4">
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <div className="overflow-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      {["Pacote", "Descrição", "DM", "Cat.", "Status", "Target"].map((h) => (
                        <th key={h} className="p-3 text-left text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {projPackages.map((pkg) => (
                      <tr key={pkg.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-3 font-medium text-foreground">{pkg.sourcePackageNumber}</td>
                        <td className="p-3 text-muted-foreground max-w-[200px] truncate">{pkg.description}</td>
                        <td className="p-3"><Badge variant="outline" className="text-xs">{pkg.dmDivision}</Badge></td>
                        <td className="p-3">{pkg.category}</td>
                        <td className="p-3"><Badge variant="secondary" className="text-xs">{pkg.status}</Badge></td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                            pkg.phaseTargetStatus === "On Track" ? "text-success" :
                            pkg.phaseTargetStatus === "At Risk" ? "text-amber-500" :
                            "text-destructive"
                          }`}>
                            {pkg.phaseTargetStatus === "On Track" && <CheckCircle2 className="h-3.5 w-3.5" />}
                            {pkg.phaseTargetStatus === "At Risk" && <AlertTriangle className="h-3.5 w-3.5" />}
                            {pkg.phaseTargetStatus === "Late" && <XCircle className="h-3.5 w-3.5" />}
                            {pkg.phaseTargetStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pns" className="mt-4">
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <div className="overflow-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      {["PN", "Descrição", "Fornecedor", "Modal", "Pacote", "Status PO", "PO"].map((h) => (
                        <th key={h} className="p-3 text-left text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {projPNs.map((pn) => (
                      <tr key={pn.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-3 font-medium text-foreground">{pn.pn}</td>
                        <td className="p-3 text-muted-foreground max-w-[200px] truncate">{pn.description}</td>
                        <td className="p-3">{pn.fornecedor}</td>
                        <td className="p-3"><Badge variant="outline" className="text-xs">{pn.modal}</Badge></td>
                        <td className="p-3 text-muted-foreground whitespace-nowrap">{getPackageName(pn.packageId)}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                            pn.statusPO === "Com PO" ? "text-success" :
                            pn.statusPO === "Pendente" ? "text-amber-500" :
                            "text-blue-500"
                          }`}>
                            {pn.statusPO === "Com PO" && <CheckCircle2 className="h-3.5 w-3.5" />}
                            {pn.statusPO === "Pendente" && <Clock className="h-3.5 w-3.5" />}
                            {pn.statusPO === "In Process" && <Clock className="h-3.5 w-3.5" />}
                            {pn.statusPO}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">{pn.po || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <Dialog open={!!modalData} onOpenChange={(open) => !open && setModalData(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{modalData?.title}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto flex-1">
            {modalData?.type === "packages" && (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {["Pacote", "Descrição", "DM", "Cat.", "Status", "Target"].map((h) => (
                      <th key={h} className="p-3 text-left text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(modalData.items as Package[]).map((pkg) => (
                    <tr key={pkg.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="p-3 font-medium text-foreground">{pkg.sourcePackageNumber}</td>
                      <td className="p-3 text-muted-foreground max-w-[200px] truncate">{pkg.description}</td>
                      <td className="p-3"><Badge variant="outline" className="text-xs">{pkg.dmDivision}</Badge></td>
                      <td className="p-3">{pkg.category}</td>
                      <td className="p-3"><Badge variant="secondary" className="text-xs">{pkg.status}</Badge></td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                          pkg.phaseTargetStatus === "On Track" ? "text-success" :
                          pkg.phaseTargetStatus === "At Risk" ? "text-amber-500" :
                          "text-destructive"
                        }`}>
                          {pkg.phaseTargetStatus === "On Track" && <CheckCircle2 className="h-3.5 w-3.5" />}
                          {pkg.phaseTargetStatus === "At Risk" && <AlertTriangle className="h-3.5 w-3.5" />}
                          {pkg.phaseTargetStatus === "Late" && <XCircle className="h-3.5 w-3.5" />}
                          {pkg.phaseTargetStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {modalData?.type === "pns" && (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {["PN", "Descrição", "Fornecedor", "Modal", "Pacote", "Status PO", "PO"].map((h) => (
                      <th key={h} className="p-3 text-left text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(modalData.items as PartNumber[]).map((pn) => (
                    <tr key={pn.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="p-3 font-medium text-foreground">{pn.pn}</td>
                      <td className="p-3 text-muted-foreground max-w-[200px] truncate">{pn.description}</td>
                      <td className="p-3">{pn.fornecedor}</td>
                      <td className="p-3"><Badge variant="outline" className="text-xs">{pn.modal}</Badge></td>
                      <td className="p-3 text-muted-foreground whitespace-nowrap">{getPackageName(pn.packageId)}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                          pn.statusPO === "Com PO" ? "text-success" :
                          pn.statusPO === "Pendente" ? "text-amber-500" :
                          "text-blue-500"
                        }`}>
                          {pn.statusPO === "Com PO" && <CheckCircle2 className="h-3.5 w-3.5" />}
                          {pn.statusPO === "Pendente" && <Clock className="h-3.5 w-3.5" />}
                          {pn.statusPO === "In Process" && <Clock className="h-3.5 w-3.5" />}
                          {pn.statusPO}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{pn.po || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
