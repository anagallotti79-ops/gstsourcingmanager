import { createContext, useContext, useState, ReactNode } from "react";
import { packages as initialPackages, partNumbers as initialPartNumbers } from "@/data/mockData";
import { Package, PartNumber } from "@/data/types";

interface DataContextType {
  pkgList: Package[];
  setPkgList: React.Dispatch<React.SetStateAction<Package[]>>;
  pnList: PartNumber[];
  setPnList: React.Dispatch<React.SetStateAction<PartNumber[]>>;
  addPackage: (pkg: Package) => void;
  addPartNumber: (pn: PartNumber) => void;
  addPartNumbers: (pns: PartNumber[]) => void;
  updatePackage: (id: string, pkg: Package) => void;
  updatePartNumber: (id: string, pn: PartNumber) => void;
  deletePackage: (id: string) => void;
  deletePartNumber: (id: string) => void;
  getPackageById: (id: string) => Package | undefined;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [pkgList, setPkgList] = useState<Package[]>(initialPackages);
  const [pnList, setPnList] = useState<PartNumber[]>(initialPartNumbers);

  const addPackage = (pkg: Package) => setPkgList((prev) => [...prev, pkg]);
  const addPartNumber = (pn: PartNumber) => setPnList((prev) => [...prev, pn]);
  const addPartNumbers = (pns: PartNumber[]) => setPnList((prev) => [...prev, ...pns]);
  const updatePackage = (id: string, pkg: Package) => setPkgList((prev) => prev.map((p) => (p.id === id ? pkg : p)));
  const updatePartNumber = (id: string, pn: PartNumber) => setPnList((prev) => prev.map((p) => (p.id === id ? pn : p)));
  const deletePackage = (id: string) => setPkgList((prev) => prev.filter((p) => p.id !== id));
  const deletePartNumber = (id: string) => setPnList((prev) => prev.filter((p) => p.id !== id));
  const getPackageById = (id: string) => pkgList.find((p) => p.id === id);

  return (
    <DataContext.Provider value={{
      pkgList, setPkgList, pnList, setPnList,
      addPackage, addPartNumber, addPartNumbers,
      updatePackage, updatePartNumber, deletePackage, deletePartNumber,
      getPackageById,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
