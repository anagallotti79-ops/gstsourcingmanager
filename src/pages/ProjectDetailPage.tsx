import { useParams, useNavigate } from "react-router-dom";
import { projects, packages, partNumbers } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";

const COLORS = ["#10B981", "#F59E0B", "#3B82F6", "#E11D48", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

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

  // Chart data: Commodity by Phase
  const phaseData = ["Source Package", "Pre-RFQ", "RFQ", "Offer Review", "Negotiation", "Summary", "Recommendation", "Closed"]
    .map((phase) => ({
      phase: phase.length > 10 ? phase.slice(0, 10) + "…" : phase,
      fullPhase: phase,
      count: projPackages.filter((p) => p.status === phase).length,
    }))
    .filter((d) => d.count > 0);

  // Chart data: Phase Target Status (donut)
  const targetData = [
    { name: "On Track", value: projPackages.filter((p) => p.phaseTargetStatus === "On Track").length, color: "#10B981" },
    { name: "At Risk", value: projPackages.filter((p) => p.phaseTargetStatus === "At Risk").length, color: "#F59E0B" },
    { name: "Late", value: projPackages.filter((p) => p.phaseTargetStatus === "Late").length, color: "#E11D48" },
  ].filter((d) => d.value > 0);

  // Chart data: DM Division breakdown
  const dmData = ["DMCA", "DMPT", "DMEM", "DMBI"]
    .map((dm) => ({
      division: dm,
      count: projPackages.filter((p) => p.dmDivision === dm).length,
    }))
    .filter((d) => d.count > 0);

  // Status PO distribution for PNs
  const poData = [
    { name: "Com PO", value: projPNs.filter((p) => p.statusPO === "Com PO").length, color: "#10B981" },
    { name: "Pendente", value: projPNs.filter((p) => p.statusPO === "Pendente").length, color: "#F59E0B" },
    { name: "In Process", value: projPNs.filter((p) => p.statusPO === "In Process").length, color: "#3B82F6" },
  ].filter((d) => d.value > 0);

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
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Commodity by Phase</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={phaseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20%)" />
                    <XAxis dataKey="phase" tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "hsl(222 47% 8%)", border: "1px solid hsl(217 33% 20%)", borderRadius: 8, color: "hsl(210 40% 96%)" }} />
                    <Bar dataKey="count" fill="hsl(160 84% 39%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Prediction Target</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={targetData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {targetData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(222 47% 8%)", border: "1px solid hsl(217 33% 20%)", borderRadius: 8, color: "hsl(210 40% 96%)" }} />
                    <Legend wrapperStyle={{ color: "hsl(215 20% 55%)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">DM Division</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dmData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20%)" />
                    <XAxis type="number" tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="division" tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }} width={50} />
                    <Tooltip contentStyle={{ background: "hsl(222 47% 8%)", border: "1px solid hsl(217 33% 20%)", borderRadius: 8, color: "hsl(210 40% 96%)" }} />
                    <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Status PO - Part Numbers</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={poData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {poData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(222 47% 8%)", border: "1px solid hsl(217 33% 20%)", borderRadius: 8, color: "hsl(210 40% 96%)" }} />
                    <Legend wrapperStyle={{ color: "hsl(215 20% 55%)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
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
