// Update this page (the content is just a fallback if you fail to update the page)

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome to Your Blank App</h1>
        <p className="text-xl text-muted-foreground">Start building your amazing project here!</p>
        <div className="mt-8">
          <Button size="lg" className="gap-2">
            <Plus size={20} />
            Novo Projeto
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
