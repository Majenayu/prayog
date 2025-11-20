import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Machine, MachineWithComponents } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Settings2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";

const SLOT_POSITIONS = {
  head: { top: '5%', left: '50%', transform: 'translateX(-50%)' },
  center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  left_upper: { top: '30%', left: '10%' },
  right_upper: { top: '30%', right: '10%' },
  left_lower: { top: '70%', left: '10%' },
  right_lower: { top: '70%', right: '10%' },
  auxiliary: { bottom: '5%', left: '50%', transform: 'translateX(-50%)' },
};

export default function MachinesPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/machines/:id");

  const { data: machines = [], isLoading: machinesLoading } = useQuery<Machine[]>({
    queryKey: ['/api/machines'],
  });

  const { data: selectedMachine, isLoading: machineLoading } = useQuery<MachineWithComponents>({
    queryKey: ['/api/machines', params?.id],
    enabled: !!params?.id,
  });

  if (match && params?.id) {
    if (machineLoading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading machine details...</p>
          </div>
        </div>
      );
    }

    if (!selectedMachine) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Machine not found</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex h-16 items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setLocation("/machines")} data-testid="button-back">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold">{selectedMachine.name}</h1>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Machine Diagram</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-muted/30 rounded-lg" style={{ height: '600px' }}>
                    {selectedMachine.components?.map((component) => {
                      const position = SLOT_POSITIONS[component.slot as keyof typeof SLOT_POSITIONS];
                      return (
                        <div
                          key={component.id}
                          className="absolute"
                          style={position}
                        >
                          <div className="flex flex-col items-center gap-2">
                            {component.product && (
                              <>
                                <img
                                  src={component.product.imageUrl}
                                  alt={component.product.name}
                                  className="w-24 h-24 object-cover rounded-md border-2 border-primary"
                                  data-testid={`img-component-${component.slot}`}
                                />
                                <span className="text-xs font-medium bg-background px-2 py-1 rounded">
                                  {component.product.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="mt-1">{selectedMachine.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge className="mt-1" data-testid="badge-status">
                      {selectedMachine.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedMachine.components?.map((component) => (
                      <div key={component.id} className="flex items-center gap-3 p-2 rounded hover-elevate" data-testid={`component-${component.slot}`}>
                        {component.product && (
                          <>
                            <img
                              src={component.product.imageUrl}
                              alt={component.product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{component.product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {component.slot.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")} data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-primary to-purple-600 rounded-lg p-2">
                  <Settings2 className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold">Available Machines</h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8">
        {machinesLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : machines.length === 0 ? (
          <div className="text-center py-12">
            <Settings2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No machines available</h2>
            <p className="text-muted-foreground">Check back later for new custom machines.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {machines.map((machine) => (
              <Card key={machine.id} className="hover-elevate cursor-pointer" onClick={() => setLocation(`/machines/${machine.id}`)} data-testid={`card-machine-${machine.id}`}>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{machine.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{machine.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge>{machine.status}</Badge>
                    <Button variant="outline" size="sm" data-testid={`button-view-${machine.id}`}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
