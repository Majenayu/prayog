import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { MachinePart, InsertMachinePart } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Plus, Trash2, Move } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PositionedPart extends MachinePart {
  isDragging?: boolean;
}

export default function ManageMachineParts() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [isAddPartOpen, setIsAddPartOpen] = useState(false);
  const [draggedPart, setDraggedPart] = useState<string | null>(null);
  const [diagramImageUrl, setDiagramImageUrl] = useState<string>("https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600");

  // Form state for new part
  const [newPart, setNewPart] = useState<Partial<InsertMachinePart> & { positionX?: number; positionY?: number; diagramImageUrl?: string }>({
    machineType: "",
    partName: "",
    partNumber: "",
    description: "",
    location: "",
    imageUrl: "",
    diagramImageUrl: "",
    positionX: 50,
    positionY: 50,
  });

  // Fetch all machine types
  const { data: machineTypes = [] } = useQuery<string[]>({
    queryKey: ["/api/machine-parts/types"],
  });

  // Fetch parts for selected machine
  const { data: parts = [], isLoading } = useQuery<MachinePart[]>({
    queryKey: ["/api/machine-parts", selectedMachine],
    enabled: !!selectedMachine,
  });

  // Create part mutation
  const createPartMutation = useMutation({
    mutationFn: async (part: InsertMachinePart & { positionX?: number; positionY?: number; diagramImageUrl?: string }) => {
      return await apiRequest("POST", "/api/machine-parts", part);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/machine-parts", selectedMachine] });
      queryClient.invalidateQueries({ queryKey: ["/api/machine-parts/types"] });
      toast({ title: "Success", description: "Machine part added successfully" });
      setIsAddPartOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add machine part", variant: "destructive" });
    },
  });

  // Update part position mutation with proper optimistic updates
  const updatePositionMutation = useMutation({
    mutationFn: async ({ id, positionX, positionY }: { id: string; positionX: number; positionY: number }) => {
      return await apiRequest("PATCH", `/api/machine-parts/${id}/position`, { positionX, positionY });
    },
    onMutate: async ({ id, positionX, positionY }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/machine-parts", selectedMachine] });

      // Snapshot previous value
      const previousParts = queryClient.getQueryData<MachinePart[]>(["/api/machine-parts", selectedMachine]);

      // Optimistically update
      queryClient.setQueryData<MachinePart[]>(
        ["/api/machine-parts", selectedMachine],
        (oldParts) => {
          if (!oldParts) return oldParts;
          return oldParts.map((part) =>
            part.id === id
              ? { ...part, positionX, positionY }
              : part
          );
        }
      );

      // Return context with snapshot
      return { previousParts };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/machine-parts", selectedMachine] });
      toast({ title: "Success", description: "Part position updated" });
    },
    onError: (error, _variables, context) => {
      // Restore snapshot on error
      if (context?.previousParts) {
        queryClient.setQueryData(["/api/machine-parts", selectedMachine], context.previousParts);
      }
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to update position", 
        variant: "destructive" 
      });
    },
  });

  const resetForm = () => {
    setNewPart({
      machineType: selectedMachine,
      partName: "",
      partNumber: "",
      description: "",
      location: "",
      imageUrl: "",
      diagramImageUrl: "",
      positionX: 50 as number,
      positionY: 50 as number,
    });
  };

  const handleAddPart = () => {
    if (!newPart.partName || !newPart.partNumber || !selectedMachine) {
      toast({ title: "Error", description: "Please fill in required fields", variant: "destructive" });
      return;
    }

    // Ensure valid numeric positions or set to null for unpositioned parts
    const sanitizedPart = {
      ...newPart as InsertMachinePart,
      machineType: selectedMachine,
      positionX: typeof newPart.positionX === 'number' ? newPart.positionX : undefined,
      positionY: typeof newPart.positionY === 'number' ? newPart.positionY : undefined,
      diagramImageUrl: newPart.diagramImageUrl || undefined,
    };

    createPartMutation.mutate(sanitizedPart);
  };

  const handleDragStart = (partId: string) => {
    setDraggedPart(partId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (!draggedPart) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Clamp values between 0 and 100
    const clampedX = Math.max(0, Math.min(100, Math.round(x)));
    const clampedY = Math.max(0, Math.min(100, Math.round(y)));

    // Mutation handles optimistic update in onMutate
    updatePositionMutation.mutate({
      id: draggedPart,
      positionX: clampedX,
      positionY: clampedY,
    });

    setDraggedPart(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/industry/dashboard")}
                data-testid="button-back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">Manage Machine Parts</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Machine Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Machine Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="machine-select">Machine Type</Label>
                <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                  <SelectTrigger id="machine-select" data-testid="select-machine-type">
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
              <div className="flex-1">
                <Label htmlFor="diagram-image">Diagram Center Image URL</Label>
                <Input
                  id="diagram-image"
                  value={diagramImageUrl}
                  onChange={(e) => setDiagramImageUrl(e.target.value)}
                  placeholder="Central machine image URL"
                  data-testid="input-diagram-image"
                />
              </div>
              <Button
                onClick={() => {
                  setNewPart({ ...newPart, machineType: selectedMachine });
                  setIsAddPartOpen(true);
                }}
                disabled={!selectedMachine}
                data-testid="button-add-part"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Part
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Visual Diagram Editor */}
        {selectedMachine && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Move className="h-5 w-5" />
                Position Parts (Drag & Drop)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Drag parts onto the diagram to position them around the machine
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-96">
                  <p className="text-muted-foreground">Loading parts...</p>
                </div>
              ) : (
                <div
                  className="relative bg-muted rounded-lg overflow-hidden"
                  style={{ width: "100%", paddingBottom: "75%", minHeight: "600px" }}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  data-testid="diagram-drop-zone"
                >
                  {/* Center Machine Image */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <img
                      src={diagramImageUrl}
                      alt="Machine"
                      className="w-64 h-64 object-contain rounded-lg border-4 border-primary shadow-lg"
                    />
                  </div>

                  {/* Positioned Parts */}
                  {parts.filter(p => p.positionX != null && p.positionY != null).map((part) => (
                    <div
                      key={part.id}
                      className="absolute cursor-move hover-elevate active-elevate-2"
                      style={{
                        left: `${part.positionX}%`,
                        top: `${part.positionY}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      draggable
                      onDragStart={() => handleDragStart(part.id)}
                      data-testid={`part-${part.id}`}
                    >
                      <Card className="w-32">
                        <CardContent className="p-2">
                          {part.diagramImageUrl && (
                            <img
                              src={part.diagramImageUrl}
                              alt={part.partName}
                              className="w-full h-20 object-cover rounded mb-1"
                            />
                          )}
                          <p className="text-xs font-semibold truncate">{part.partName}</p>
                          <p className="text-xs text-muted-foreground truncate">{part.partNumber}</p>
                        </CardContent>
                      </Card>

                      {/* Connecting Line to Center */}
                      <svg
                        className="absolute top-1/2 left-1/2 pointer-events-none"
                        style={{
                          width: "200%",
                          height: "200%",
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <line
                          x1="50%"
                          y1="50%"
                          x2={`calc(50% - ${part.positionX! - 50}%)`}
                          y2={`calc(50% - ${part.positionY! - 50}%)`}
                          stroke="hsl(var(--primary))"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          opacity="0.5"
                        />
                      </svg>
                    </div>
                  ))}

                  {/* Unpositioned Parts List */}
                  {parts.filter(p => p.positionX == null || p.positionY == null).length > 0 && (
                    <div className="absolute top-4 right-4 bg-background rounded-lg p-4 shadow-lg max-w-xs">
                      <h3 className="font-semibold mb-2 text-sm">Unpositioned Parts</h3>
                      <p className="text-xs text-muted-foreground mb-2">Drag these onto the diagram:</p>
                      <div className="space-y-2">
                        {parts.filter(p => p.positionX == null || p.positionY == null).map((part) => (
                          <div
                            key={part.id}
                            className="p-2 bg-muted rounded cursor-move hover-elevate"
                            draggable
                            onDragStart={() => handleDragStart(part.id)}
                            data-testid={`unpositioned-part-${part.id}`}
                          >
                            <p className="text-xs font-semibold">{part.partName}</p>
                            <p className="text-xs text-muted-foreground">{part.partNumber}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Part Dialog */}
      <Dialog open={isAddPartOpen} onOpenChange={setIsAddPartOpen}>
        <DialogContent className="max-w-2xl" data-testid="dialog-add-part">
          <DialogHeader>
            <DialogTitle>Add New Machine Part</DialogTitle>
            <DialogDescription>
              Add a new part for {selectedMachine}. You can position it on the diagram after adding.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="part-name">Part Name *</Label>
              <Input
                id="part-name"
                value={newPart.partName || ""}
                onChange={(e) => setNewPart({ ...newPart, partName: e.target.value })}
                placeholder="e.g., Spindle Motor"
                data-testid="input-part-name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="part-number">Part Number *</Label>
              <Input
                id="part-number"
                value={newPart.partNumber || ""}
                onChange={(e) => setNewPart({ ...newPart, partNumber: e.target.value })}
                placeholder="e.g., CNC-SM-2000"
                data-testid="input-part-number"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newPart.description || ""}
                onChange={(e) => setNewPart({ ...newPart, description: e.target.value })}
                placeholder="Detailed description of the part"
                rows={3}
                data-testid="input-description"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location on Machine</Label>
              <Input
                id="location"
                value={newPart.location || ""}
                onChange={(e) => setNewPart({ ...newPart, location: e.target.value })}
                placeholder="e.g., Top center of machine"
                data-testid="input-location"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image-url">Part Image URL</Label>
              <Input
                id="image-url"
                value={newPart.imageUrl || ""}
                onChange={(e) => setNewPart({ ...newPart, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                data-testid="input-image-url"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="diagram-image-url">Diagram Thumbnail URL (for positioning)</Label>
              <Input
                id="diagram-image-url"
                value={newPart.diagramImageUrl || ""}
                onChange={(e) => setNewPart({ ...newPart, diagramImageUrl: e.target.value })}
                placeholder="https://example.com/thumbnail.jpg"
                data-testid="input-diagram-image-url"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPartOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button
              onClick={handleAddPart}
              disabled={createPartMutation.isPending}
              data-testid="button-save-part"
            >
              {createPartMutation.isPending ? "Adding..." : "Add Part"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
