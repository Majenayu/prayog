import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Wrench, MapPin, Info } from "lucide-react";
import { MachinePart } from "@shared/schema";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function MachineDiagramViewer() {
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<MachinePart | null>(null);

  const { data: machineTypes = [] } = useQuery<string[]>({
    queryKey: ['/api/machine-parts/types'],
    enabled: open,
  });

  const { data: parts = [], isLoading } = useQuery<MachinePart[]>({
    queryKey: [`/api/machine-parts/${selectedMachine}`],
    enabled: open && !!selectedMachine,
  });

  const centerImageUrl = selectedMachine === "CNC Machine" 
    ? "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400"
    : selectedMachine === "Hydraulic Press"
    ? "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400"
    : "https://images.unsplash.com/photo-1563191911-e65f8655ebf9?w=400";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" data-testid="button-machine-diagram">
          <Package className="h-4 w-4" />
          Parts Diagram
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Interactive Machine Parts Diagram</DialogTitle>
          <DialogDescription>
            Visual guide showing where each part is located on the machine
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Machine Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Select Machine Type</label>
            <Select value={selectedMachine} onValueChange={setSelectedMachine}>
              <SelectTrigger data-testid="select-machine-type">
                <SelectValue placeholder="Choose a machine type..." />
              </SelectTrigger>
              <SelectContent>
                {machineTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Visual Diagram */}
          {selectedMachine && !isLoading && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border p-8 min-h-[600px] relative">
                {/* Central Machine Image */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          <img
                            src={centerImageUrl}
                            alt={selectedMachine}
                            className="w-64 h-64 object-contain rounded-lg border-4 border-primary shadow-2xl bg-background relative z-10"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold">{selectedMachine}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Parts positioned around the machine */}
                {parts.map((part, index) => {
                  const posX = part.positionX ?? (index % 2 === 0 ? 15 : 70);
                  const posY = part.positionY ?? (Math.floor(index / 2) * 25 + 10);
                  
                  return (
                    <TooltipProvider key={part.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setSelectedPart(part)}
                            className="absolute group cursor-pointer transform hover:scale-110 transition-all"
                            style={{ 
                              left: `${posX}%`, 
                              top: `${posY}%`,
                              transform: 'translate(-50%, -50%)'
                            }}
                            data-testid={`part-${part.id}`}
                          >
                            <div className="relative">
                              {/* Connector line to center */}
                              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30 group-hover:opacity-60 transition-opacity" style={{ overflow: 'visible' }}>
                                <line
                                  x1="50%"
                                  y1="50%"
                                  x2={`${50 - posX}%`}
                                  y2={`${50 - posY}%`}
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeDasharray="5,5"
                                  className="text-primary"
                                />
                              </svg>
                              
                              <div className="bg-background border-2 border-primary rounded-lg p-3 shadow-lg hover:shadow-xl transition-shadow min-w-[120px]">
                                {part.diagramImageUrl && (
                                  <img
                                    src={part.diagramImageUrl}
                                    alt={part.partName}
                                    className="w-16 h-16 object-contain mx-auto mb-2 rounded"
                                  />
                                )}
                                <p className="text-xs font-semibold text-center">{part.partName}</p>
                                {part.partNumber && (
                                  <p className="text-[10px] text-muted-foreground text-center mt-1">
                                    #{part.partNumber}
                                  </p>
                                )}
                                <Badge variant="outline" className="mt-2 w-full justify-center text-[10px]">
                                  <MapPin className="h-2 w-2 mr-1" />
                                  Click for details
                                </Badge>
                              </div>
                            </div>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="font-semibold">{part.partName}</p>
                          <p className="text-xs text-muted-foreground mt-1">{part.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>

              {/* Parts List Below */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {parts.map((part) => (
                  <Card 
                    key={part.id} 
                    className="hover-elevate cursor-pointer transition-all"
                    onClick={() => setSelectedPart(part)}
                    data-testid={`part-card-${part.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-sm">{part.partName}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          <Wrench className="h-3 w-3" />
                        </Badge>
                      </div>
                      {part.partNumber && (
                        <CardDescription className="text-xs">
                          Part #: {part.partNumber}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="bg-primary/5 p-2 rounded-md border-l-2 border-primary">
                        <p className="text-xs font-medium text-primary flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {part.location}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Loading machine diagram...</p>
              </div>
            </div>
          )}
        </div>

        {/* Part Details Dialog */}
        {selectedPart && (
          <Dialog open={!!selectedPart} onOpenChange={() => setSelectedPart(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  {selectedPart.partName}
                </DialogTitle>
                <DialogDescription>
                  {selectedPart.partNumber && `Part #: ${selectedPart.partNumber}`}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {selectedPart.diagramImageUrl && (
                  <div className="flex justify-center">
                    <img
                      src={selectedPart.diagramImageUrl}
                      alt={selectedPart.partName}
                      className="w-48 h-48 object-contain rounded-lg border"
                    />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedPart.description}</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Location in Machine
                  </h4>
                  <p className="text-sm font-medium text-primary">{selectedPart.location}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
