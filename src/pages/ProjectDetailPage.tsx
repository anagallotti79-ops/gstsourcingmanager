import { useParams, useNavigate } from "react-router-dom";
import { projects, packages, partNumbers } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend, LabelList,
} from "recharts";
import { calculatePredictionWeeks } from "@/lib/dateUtils";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find((p) => p.id === id);
  const projPackages = packages.filter((p) => p.projectId === id);
  const projPNs = partNumbers.filter((p) => p.projectId === id);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Projeto não encontrado</p>
      </div>
    );
  }

  // ── Dashboard 1: Commodity by DM Division (with count label on top of bars) ──
  const dmPhaseData = ["DMCA", "DMPT", "DMEM", "DMBI"].map((dm) => ({
    division: dm,
    count: projPackages.filter((p) => p.dmDivision === dm).length,
  })).filter((d) => d.count > 0);

  // ── Dashboard 2: Prediction Target based on sem.prediction weeks ──
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

  // ── Dashboard 3: Current Phase Target – stacked bar per phase ──
  const phases = ["Source Package", "Pre-RFQ", "RFQ", "Offer Review", "Negotiation", "Summary", "Recommendation", "Closed"];
  const phaseTargetData = phases
    .map((phase) => {
      const pkgsInPhase = projPackages.filter((p) => p.status === phase);
      return {
        phase: phase.length > 9 ? phase.slice(0, 9) + "…" : phase,
        "On Track": pkgsInPhase.filter((p) => p.phaseTargetStatus === "On Track").length,
        "At Risk": pkgsInPhase.filter((p) => p.phaseTargetStatus === "At Risk").length,
        Late: pkgsInPhase.filter((p) => p.phaseTargetStatus === "Late").length,
        Closed: phase === "Closed" ? pkgsInPhase.length : 0,
      };
    })
    .filter((d) => d["On Track"] + d["At Risk"] + d.Late + d.Closed > 0);

  // ── Dashboard 4: Status PO – Part Numbers (unchanged) ──
  const poData = [
    { name: "Com PO", value: projPNs.filter((p) => p.statusPO === "Com PO").length, color: "#10B981" },
    { name: "Pendente", value: projPNs.filter((p) => p.statusPO === "Pendente").length, color: "#F59E0B" },
    { name: "In Process", value: projPNs.filter((p) => p.statusPO === "In Process").length, color: "#3B82F6" },
  ].filter((d) => d.value > 0);

  // ── Dashboard 5: Monthly Closing Prediction (Area chart) ──
  const monthMap: Record<string, number> = {};
  projPackages.forEach((pkg) => {
    const date = pkg.recommendationPredictionDate;
    if (!date || date === "TBD") return;
    const d = new Date(date);
    if (isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap[key] = (monthMap[key] || 0) + 1;
  });
  const monthlyData = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      month: new Date(month + "-01").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      pacotes: count,
    }));

  const tooltipStyle = {
    contentStyle: {
      background: "hsl(222 47% 8%)",
      border: "1px solid hsl(217 33% 20%)",
      borderRadius: 8,
      color: "hsl(210 40% 96%)",
    },
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

          {/* Charts grid – first row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 1. Commodity by DM Division – bar with count labels on top */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Commodity by Phase (DM Division)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dmPhaseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20%)" />
                    <XAxis dataKey="division" tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }} />
                    <YAxis tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} allowDecimals={false} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="count" fill="hsl(160 84% 39%)" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="count" position="top" style={{ fill: "hsl(210 40% 96%)", fontSize: 12, fontWeight: 600 }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 2. Prediction Target – donut based on sem.prediction thresholds */}
            <Card className="bg-card border-border">
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

            {/* 3. Current Phase Target – stacked bars per phase */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Current Phase Target</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={phaseTargetData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20%)" />
                    <XAxis dataKey="phase" tick={{ fill: "hsl(215 20% 55%)", fontSize: 10 }} />
                    <YAxis tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} allowDecimals={false} />
                    <Tooltip {...tooltipStyle} />
                    <Legend wrapperStyle={{ color: "hsl(215 20% 55%)", fontSize: 11 }} />
                    <Bar dataKey="On Track" stackId="a" fill="#10B981" />
                    <Bar dataKey="At Risk" stackId="a" fill="#F59E0B" />
                    <Bar dataKey="Late" stackId="a" fill="#E11D48" />
                    <Bar dataKey="Closed" stackId="a" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 4. Status PO – Part Numbers (unchanged) */}
            <Card className="bg-card border-border">
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

          {/* 5. Monthly Closing Prediction – full width Area chart */}
          <Card className="bg-card border-border">
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
                  <AreaChart data={monthlyData}>
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
                          <Badge className={`text-xs ${
                            pkg.phaseTargetStatus === "On Track" ? "bg-success text-success-foreground" :
                            pkg.phaseTargetStatus === "At Risk" ? "bg-warning text-warning-foreground" :
                            "bg-destructive text-destructive-foreground"
                          }`}>
                            {pkg.phaseTargetStatus}
                          </Badge>
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
                      {["PN", "Descrição", "Fornecedor", "Modal", "Status PO", "PO"].map((h) => (
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
                        <td className="p-3">
                          <Badge className={`text-xs ${
                            pn.statusPO === "Com PO" ? "bg-success text-success-foreground" :
                            pn.statusPO === "Pendente" ? "bg-warning text-warning-foreground" :
                            "bg-info text-info-foreground"
                          }`}>
                            {pn.statusPO}
                          </Badge>
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
    </div>
  );
}
