import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Package, PartNumber } from "@/data/types";

export interface CancelledPackage extends Package { cancelledDate: string }
export interface CancelledPartNumber extends PartNumber { cancelledDate: string }

interface CancelledContextType {
  cancelledPackages: CancelledPackage[];
  cancelledPartNumbers: CancelledPartNumber[];
  cancelPackage: (pkg: Package) => void;
  cancelPartNumber: (pn: PartNumber) => void;
  restorePackage: (id: string) => Package | undefined;
  restorePartNumber: (id: string) => PartNumber | undefined;
}

const CancelledContext = createContext<CancelledContextType | null>(null);

export function CancelledProvider({ children }: { children: ReactNode }) {
  const [cancelledPackages, setCancelledPackages] = useState<CancelledPackage[]>([]);
  const [cancelledPartNumbers, setCancelledPartNumbers] = useState<CancelledPartNumber[]>([]);

  const cancelPackage = useCallback((pkg: Package) => {
    setCancelledPackages((prev) => [...prev, { ...pkg, cancelledDate: new Date().toISOString().slice(0, 10) }]);
  }, []);

  const cancelPartNumber = useCallback((pn: PartNumber) => {
    setCancelledPartNumbers((prev) => [...prev, { ...pn, cancelledDate: new Date().toISOString().slice(0, 10) }]);
  }, []);

  const restorePackage = useCallback((id: string): Package | undefined => {
    let restored: Package | undefined;
    setCancelledPackages((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) {
        const { cancelledDate, ...pkg } = item;
        restored = pkg;
      }
      return prev.filter((p) => p.id !== id);
    });
    return restored;
  }, []);

  const restorePartNumber = useCallback((id: string): PartNumber | undefined => {
    let restored: PartNumber | undefined;
    setCancelledPartNumbers((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) {
        const { cancelledDate, ...pn } = item;
        restored = pn;
      }
      return prev.filter((p) => p.id !== id);
    });
    return restored;
  }, []);

  return (
    <CancelledContext.Provider value={{ cancelledPackages, cancelledPartNumbers, cancelPackage, cancelPartNumber, restorePackage, restorePartNumber }}>
      {children}
    </CancelledContext.Provider>
  );
}

export function useCancelled() {
  const ctx = useContext(CancelledContext);
  if (!ctx) throw new Error("useCancelled must be used within CancelledProvider");
  return ctx;
}
