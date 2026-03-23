export type ProjectStatus = "Em Andamento" | "Planejamento" | "Finalizado";

export type DmDivision = "DMCA" | "DMPT" | "DMEM" | "DMBI";
export type PackageCategory = "SPF" | "TH" | "PWT" | "MO";
export type PackageStatus = "Source Package" | "Pre-RFQ" | "RFQ" | "Offer Review" | "Negotiation" | "Summary" | "Recommendation" | "Closed";
export type PhaseTargetStatus = "Late" | "At Risk" | "On Track";

export type Modal = "IRF" | "Direct Buy" | "Nacional";
export type StatusPO = "Com PO" | "Pendente" | "In Process";
export type StatusRDA = "Com PO" | "Pendente" | "In Process" | "NA";
export type StatusTPO = "Com PO" | "Pendente" | "In Process" | "NA";

export interface DateField {
  target: string; // ISO date
  done?: string;  // ISO date or undefined
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  totalPackages: number;
  totalPNs: number;
  progress: number;
  description: string;
}

export interface Package {
  id: string;
  projectId: string;
  sourcePackageNumber: string;
  description: string;
  ppm: string;
  pb: string;
  dmDivision: DmDivision;
  category: PackageCategory;
  status: PackageStatus;
  phaseTargetStatus: PhaseTargetStatus;
  createdDate: string;
  totalDays: number;
  recommendationPredictionDate: string;
  comments?: string;
}

export interface PartNumber {
  id: string;
  packageId?: string;
  projectId: string;
  pn: string;
  pnEra: string;
  projeto: string;
  description: string;
  pb: string;
  fornecedor: string;
  modal: Modal;
  statusPO: StatusPO;
  po: string;
  previsaoEmissaoPO: string;
  rda: string;
  statusRDA: StatusRDA;
  tpo: string;
  statusTPO: StatusTPO;
  previsaoEmissaoTPO: string;
  comments?: string;
}
