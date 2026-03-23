import { useCancelled } from "@/contexts/CancelledContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { formatDate, calculateWeeks, calculatePredictionWeeks, getDateStatus } from "@/lib/dateUtils";
import { CheckCircle2, AlertTriangle, XCircle, Clock, Loader2, Minus, RotateCcw } from "lucide-react";
import type { DateField } from "@/data/types";

function DateCell({ field }: { field: DateField }) {
  const status = getDateStatus(field);
  const dateStr = field.done || field.target;
  const colorClass = status === "done" ? "text-success" : status === "late" ? "text-destructive" : "text-muted-foreground";
  return <span className={`text-xs font-medium ${colorClass}`}>{formatDate(dateStr)}</span>;
}

const targetBadge = (status: string) => {
  if (status === "On Track") return <span className="flex items-center gap-1 text-xs font-medium text-success"><CheckCircle2 size={13} />On Track</span>;
  if (status === "At Risk") return <span className="flex items-center gap-1 text-xs font-medium text-warning"><AlertTriangle size={13} />At Risk</span>;
  return <span className="flex items-center gap-1 text-xs font-medium text-destructive"><XCircle size={13} />Late</span>;
};

const statusPOBadge = (status: string) => {
  if (status === "Com PO") return <span className="flex items-center gap-1 text-xs font-medium text-success"><CheckCircle2 size={13} />{status}</span>;
  if (status === "Pendente") return <span className="flex items-center gap-1 text-xs font-medium text-warning"><Clock size={13} />{status}</span>;
  if (status === "In Process") return <span className="flex items-center gap-1 text-xs font-medium text-info"><Loader2 size={13} />{status}</span>;
  if (status === "NA") return <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground"><Minus size={13} />{status}</span>;
  return <span className="text-xs text-muted-foreground">{status}</span>;
};

export default function CancelledPage() {
  const { cancelledPackages, cancelledPartNumbers, restorePackage, restorePartNumber } = useCancelled();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cancelados</h1>
        <p className="text-sm text-muted-foreground mt-1">Pacotes e Part Numbers cancelados — clique com o botão direito para restaurar</p>
      </div>

      <Tabs defaultValue="packages" className="w-full">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="packages">Pacotes Cancelados ({cancelledPackages.length})</TabsTrigger>
          <TabsTrigger value="partnumbers">Part Numbers Cancelados ({cancelledPartNumbers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="packages">
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <div className="overflow-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-card z-10">
                    <tr className="border-b border-border">
                      {["Source Package", "Descrição", "PPM", "PB", "DM Div.", "Cat.", "Status", "Target Status", "Sem. Total", "Sem. Previsão", "Data Previsão", "Data Cancelamento"].map((h) => (
                        <th key={h} className="p-3 text-left text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cancelledPackages.map((pkg, i) => (
                      <ContextMenu key={pkg.id}>
                        <ContextMenuTrigger asChild>
                          <tr className={`border-b border-border/50 opacity-60 hover:opacity-80 cursor-pointer transition-all ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
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
                            <td className="p-3 text-warning whitespace-nowrap font-medium">{formatDate(pkg.cancelledDate)}</td>
                          </tr>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-40">
                          <ContextMenuItem className="gap-2 cursor-pointer" onClick={() => restorePackage(pkg.id)}>
                            <RotateCcw size={14} /> Restaurar
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                    {cancelledPackages.length === 0 && (
                      <tr><td colSpan={12} className="p-8 text-center text-muted-foreground">Nenhum pacote cancelado</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partnumbers">
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <div className="overflow-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-card z-10">
                    <tr className="border-b border-border">
                      {["PN", "ERA", "Projeto", "Descrição", "PB", "Fornecedor", "Modal", "TKO", "OT", "OTOP", "Status PO", "PO", "Prev. PO", "RDA", "Status RDA", "TPO", "Status TPO", "Prev. TPO", "Data Cancelamento"].map((h) => (
                        <th key={h} className="p-3 text-left text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cancelledPartNumbers.map((pn, i) => (
                      <ContextMenu key={pn.id}>
                        <ContextMenuTrigger asChild>
                          <tr className={`border-b border-border/50 opacity-60 hover:opacity-80 cursor-pointer transition-all ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                            <td className="p-3 font-medium text-foreground whitespace-nowrap">{pn.pn}</td>
                            <td className="p-3 text-muted-foreground">{pn.pnEra}</td>
                            <td className="p-3 text-muted-foreground whitespace-nowrap">{pn.projeto}</td>
                            <td className="p-3 text-muted-foreground max-w-[160px] truncate">{pn.description}</td>
                            <td className="p-3 text-muted-foreground">{pn.pb}</td>
                            <td className="p-3 text-muted-foreground whitespace-nowrap">{pn.fornecedor}</td>
                            <td className="p-3"><Badge variant="outline" className="text-[10px]">{pn.modal}</Badge></td>
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
                            <td className="p-3 text-warning whitespace-nowrap font-medium">{formatDate(pn.cancelledDate)}</td>
                          </tr>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-40">
                          <ContextMenuItem className="gap-2 cursor-pointer" onClick={() => restorePartNumber(pn.id)}>
                            <RotateCcw size={14} /> Restaurar
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                    {cancelledPartNumbers.length === 0 && (
                      <tr><td colSpan={19} className="p-8 text-center text-muted-foreground">Nenhum part number cancelado</td></tr>
                    )}
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
