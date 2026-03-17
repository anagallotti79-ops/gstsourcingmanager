import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ExportColumn {
  header: string;
  accessor: (row: Record<string, unknown>) => string;
}

export function exportToExcel(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  fileName: string
) {
  const rows = data.map((row) =>
    Object.fromEntries(columns.map((col) => [col.header, col.accessor(row)]))
  );
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Dados");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export function exportToPDF(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  fileName: string,
  title: string
) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text(title, 14, 18);
  doc.setFontSize(8);
  doc.text(`Exportado em ${new Date().toLocaleDateString("pt-BR")}`, 14, 24);

  autoTable(doc, {
    startY: 30,
    head: [columns.map((c) => c.header)],
    body: data.map((row) => columns.map((col) => col.accessor(row))),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], fontSize: 7 },
  });

  doc.save(`${fileName}.pdf`);
}

export function parseImportedFile(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
        resolve(json);
      } catch {
        reject(new Error("Erro ao ler arquivo"));
      }
    };
    reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    reader.readAsArrayBuffer(file);
  });
}
