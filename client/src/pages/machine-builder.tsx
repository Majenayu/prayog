import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { IndustryProduct, Machine } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Plus, Save, Settings2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const SLOT_POSITIONS = {
  head: { top: '10%', left: '50%', transform: 'translateX(-50%)' },
  body: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  left: { top: '50%', left: '10%', transform: 'translateY(-50%)' },
  right: { top: '50%', right: '10%', transform: 'translateY(-50%)' },
  bottom: { bottom: '10%', left: '50%', transform: 'translateX(-50%)' },
};

export default function MachineBuilder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [machineName, setMachineName] = useState("");
  const [machineDescription, setMachineDescription] = useState("");
  const [machineType, setMachineType] = useState("");
  const [components, setComponents] = useState<Record<string, string>>({});

  const { data: products = [] } = useQuery<IndustryProduct[]>({
    queryKey: ['/api/items/my-items'],
  });

  const { data: machines = [] } = useQuery<Machine[]>({
    queryKey: ['/api/machines/industry/my-machines'],
  });

  const createMachineMutation = useMutation({
    mutationFn: async (data: { 
      name: string; 
      description: string; 
      machineType: string; 
      status: 'draft' | 'available'; 
      components: Array<{ slot: string; industryProductId: string }> 
    }) => {
      const machineResponse = await apiRequest("POST", "/api/machines", {
        name: data.name,
        description: data.description,
        machineType: data.machineType,
        status: data.status,
      });
      const machine = await machineResponse.json();
      
      if (data.components.length > 0) {
        await apiRequest("POST", `/api/machines/${machine.id}/components`, {
          components: data.components,
        });
      }
      
      return machine;
    },
    onSuccess: (machine, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/machines/industry/my-machines'] });
      setMachineName("");
      setMachineDescription("");
      setMachineType("");
      setComponents({});
      toast({
        title: variables.status === 'draft' ? "Draft saved" : "Machine created",
        description: variables.status === 'draft' 
          ? "Your machine draft has been saved. You can continue editing it later." 
          : "Your custom machine is now available for rent.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save machine",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = (status: 'draft' | 'available') => {
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

    if (status === 'available' && componentArray.length === 0) {
      toast({
        title: "No components selected",
        description: "Please select at least one component before making it available.",
        variant: "destructive",
      });
      return;
    }

    createMachineMutation.mutate({
      name: machineName,
      description: machineDescription,
      machineType,
      status,
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
                <CardTitle>Machine Package Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="machineType">Machine Type</Label>
                  <Input
                    id="machineType"
                    value={machineType}
                    onChange={(e) => setMachineType(e.target.value)}
                    placeholder="e.g., Industrial Robot, CNC Machine"
                    data-testid="input-machine-type"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Package Name</Label>
                  <Input
                    id="name"
                    value={machineName}
                    onChange={(e) => setMachineName(e.target.value)}
                    placeholder="Enter package name"
                    data-testid="input-machine-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={machineDescription}
                    onChange={(e) => setMachineDescription(e.target.value)}
                    placeholder="Describe your machine package"
                    rows={3}
                    data-testid="input-machine-description"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select Parts from Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { slot: 'head', label: 'Head Component' },
                  { slot: 'body', label: 'Body Component' },
                  { slot: 'left', label: 'Left Side Component' },
                  { slot: 'right', label: 'Right Side Component' },
                  { slot: 'bottom', label: 'Bottom Component' },
                ].map(({ slot, label }) => (
                  <div key={slot} className="space-y-2">
                    <Label htmlFor={slot}>{label}</Label>
                    <Select
                      value={components[slot] || ""}
                      onValueChange={(value) => setComponents({ ...components, [slot]: value })}
                    >
                      <SelectTrigger id={slot} data-testid={`select-${slot}`}>
                        <SelectValue placeholder="Select a part from inventory" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - ${product.pricePerDay}/day
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSave('draft')}
                    disabled={createMachineMutation.isPending}
                    variant="outline"
                    className="flex-1"
                    data-testid="button-save-draft"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {createMachineMutation.isPending ? "Saving..." : "Save as Draft"}
                  </Button>
                  <Button
                    onClick={() => handleSave('available')}
                    disabled={createMachineMutation.isPending}
                    className="flex-1"
                    data-testid="button-create-machine"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {createMachineMutation.isPending ? "Creating..." : "Create & Publish"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Machine Package Preview</CardTitle>
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
                        className="absolute z-10"
                        style={position}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-24 h-24 object-cover rounded-md border-2 border-primary shadow-lg"
                          />
                          <Badge variant="secondary" className="text-xs">
                            {slot.charAt(0).toUpperCase() + slot.slice(1)}
                          </Badge>
                          <span className="text-xs font-medium bg-background px-2 py-1 rounded shadow">
                            {product.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {Object.keys(components).length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-muted-foreground">Select components from your inventory to build your machine</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Your Machines</h2>
          {machines.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No machines yet. Create your first machine above!
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {machines.map((machine) => (
                <Card key={machine.id} className="hover-elevate">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-1">{machine.name}</CardTitle>
                      <Badge 
                        variant={machine.status === 'draft' ? 'outline' : 'default'} 
                        data-testid={`badge-status-${machine.id}`}
                      >
                        {machine.status === 'draft' ? 'Draft' : 'Published'}
                      </Badge>
                    </div>
                    <Badge variant="secondary" className="w-fit" data-testid={`badge-type-${machine.id}`}>
                      {machine.machineType || 'Custom Machine'}
                    </Badge>
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
          )}
        </div>
      </main>
    </div>
  );
}
