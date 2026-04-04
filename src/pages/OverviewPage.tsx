import { useNavigate } from "react-router-dom";
import { projects } from "@/data/mockData";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FolderOpen, Box, FileText, TrendingUp } from "lucide-react";

const statusColors: Record<string, string> = {
  "Em Andamento": "bg-info text-info-foreground",
  "Planejamento": "bg-warning text-warning-foreground",
  "Finalizado": "bg-success text-success-foreground",
};

export default function OverviewPage() {
  const navigate = useNavigate();
  const { pkgList, pnList } = useData();

  const totalPackages = pkgList.length;
  const totalPNs = pnList.length;
  const avgProgress = Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length);

  const kpis = [
    { label: "Total Projetos", value: projects.length, icon: FolderOpen, color: "text-primary" },
    { label: "Pacotes GST", value: totalPackages, icon: Box, color: "text-info" },
    { label: "Part Numbers", value: totalPNs, icon: FileText, color: "text-warning" },
    { label: "Progresso Médio", value: `${avgProgress}%`, icon: TrendingUp, color: "text-success" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Visão Geral</h1>
        <p className="text-sm text-muted-foreground mt-1">Resumo executivo dos projetos de sourcing</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{kpi.value}</p>
                </div>
                <kpi.icon className={`h-8 w-8 ${kpi.color} opacity-70`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Project Cards */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Projetos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const projPackages = pkgList.filter((p) => p.projectId === project.id);
            const projPNs = pnList.filter((p) => p.projectId === project.id);
            return (
              <Card
                key={project.id}
                className="bg-card border-border cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-150"
                onClick={() => navigate(`/projeto/${project.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base font-semibold text-foreground">{project.name}</CardTitle>
                    <Badge className={statusColors[project.status] || ""}>{project.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{project.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{projPackages.length} pacotes</span>
                    <span>{projPNs.length} PNs</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium text-foreground">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2 bg-muted" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
