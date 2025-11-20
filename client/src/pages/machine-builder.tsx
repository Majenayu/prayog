import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { IndustryProduct, Machine } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Plus, Save, Settings2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const SLOT_POSITIONS = {
  head: { top: '5%', left: '50%', transform: 'translateX(-50%)' },
  center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  left_upper: { top: '30%', left: '10%' },
  right_upper: { top: '30%', right: '10%' },
  left_lower: { top: '70%', left: '10%' },
  right_lower: { top: '70%', right: '10%' },
  auxiliary: { bottom: '5%', left: '50%', transform: 'translateX(-50%)' },
};

export default function MachineBuilder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [machineName, setMachineName] = useState("");
  const [machineDescription, setMachineDescription] = useState("");
  const [components, setComponents] = useState<Record<string, string>>({});

  const { data: products = [] } = useQuery<IndustryProduct[]>({
    queryKey: ['/api/items/my-items'],
  });

  const { data: machines = [] } = useQuery<Machine[]>({
    queryKey: ['/api/machines/industry/my-machines'],
  });

  const createMachineMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; components: any[] }) => {
      const machineResponse = await apiRequest("POST", "/api/machines", {
        name: data.name,
        description: data.description,
      });
      const machine = await machineResponse.json();
      
      await apiRequest("POST", `/api/machines/${machine.id}/components`, {
        components: data.components,
      });
      
      return machine;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/machines/industry/my-machines'] });
      setMachineName("");
      setMachineDescription("");
      setComponents({});
      toast({
        title: "Machine created",
        description: "Your custom machine has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create machine",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!machineName || !machineDescription) {
      toast({
        title: "Missing information",
        description: "Please provide machine name and description.",
        variant: "destructive",
      });
      return;
    }

    const componentArray = Object.entries(components)
      .filter(([_, productId]) => productId)
      .map(([slot, productId]) => ({
        slot,
        industryProductId: productId,
      }));

    if (componentArray.length === 0) {
      toast({
        title: "No components selected",
        description: "Please select at least one component.",
        variant: "destructive",
      });
      return;
    }

    createMachineMutation.mutate({
      name: machineName,
      description: machineDescription,
      components: componentArray,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/industry")} data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-primary to-purple-600 rounded-lg p-2">
                  <Settings2 className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold">Machine Builder</h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Machine Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Machine Name</Label>
                  <Input
                    id="name"
                    value={machineName}
                    onChange={(e) => setMachineName(e.target.value)}
                    placeholder="Enter machine name"
                    data-testid="input-machine-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={machineDescription}
                    onChange={(e) => setMachineDescription(e.target.value)}
                    placeholder="Describe your machine"
                    rows={3}
                    data-testid="input-machine-description"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(SLOT_POSITIONS).map(([slot, _]) => (
                  <div key={slot} className="space-y-2">
                    <Label htmlFor={slot}>
                      {slot.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    <Select
                      value={components[slot] || ""}
                      onValueChange={(value) => setComponents({ ...components, [slot]: value })}
                    >
                      <SelectTrigger id={slot} data-testid={`select-${slot}`}>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}

                <Button
                  onClick={handleSave}
                  disabled={createMachineMutation.isPending}
                  className="w-full"
                  data-testid="button-save-machine"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {createMachineMutation.isPending ? "Creating..." : "Create Machine"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Machine Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-muted/30 rounded-lg" style={{ height: '600px' }}>
                  {Object.entries(components).map(([slot, productId]) => {
                    const product = products.find(p => p.id === productId);
                    if (!product) return null;
                    
                    const position = SLOT_POSITIONS[slot as keyof typeof SLOT_POSITIONS];
                    return (
                      <div
                        key={slot}
                        className="absolute"
                        style={position}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-24 h-24 object-cover rounded-md border-2 border-primary"
                          />
                          <span className="text-xs font-medium bg-background px-2 py-1 rounded">
                            {product.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {Object.keys(components).length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-muted-foreground">Select components to preview</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Your Machines</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {machines.map((machine) => (
              <Card key={machine.id} className="hover-elevate">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{machine.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{machine.description}</p>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setLocation(`/machines/${machine.id}`)}
                    data-testid={`button-view-${machine.id}`}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
