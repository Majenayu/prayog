import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Wrench, MapPin, Package } from "lucide-react";
import { MachinePart } from "@shared/schema";

export function MachinePartsViewer() {
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [open, setOpen] = useState(false);

  const { data: machineTypes = [] } = useQuery<string[]>({
    queryKey: ['/api/machine-parts/types'],
    enabled: open,
  });

  const { data: parts = [], isLoading } = useQuery<MachinePart[]>({
    queryKey: [`/api/machine-parts/${selectedMachine}`],
    enabled: open && !!selectedMachine,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Wrench className="h-4 w-4" />
          Machine Parts Locator
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Machine Parts Location Guide</DialogTitle>
          <DialogDescription>
            Search for machine parts and find their exact locations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Machine Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Select Machine Type</label>
            <Select value={selectedMachine} onValueChange={setSelectedMachine}>
              <SelectTrigger>
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

          {/* Parts List */}
          {selectedMachine && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Parts for {selectedMachine}
              </h3>

              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : parts.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No parts found for this machine type.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {parts.map((part) => (
                    <Card key={part.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{part.partName}</CardTitle>
                            {part.partNumber && (
                              <CardDescription className="text-xs mt-1">
                                Part #: {part.partNumber}
                              </CardDescription>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            Location
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <div className="text-sm font-semibold mb-1">Description:</div>
                          <p className="text-sm text-muted-foreground">{part.description}</p>
                        </div>
                        
                        <div className="bg-primary/5 p-3 rounded-md border-l-4 border-primary">
                          <div className="text-sm font-semibold mb-1 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            Location in Machine:
                          </div>
                          <p className="text-sm font-medium text-primary">{part.location}</p>
                        </div>

                        {part.imageUrl && (
                          <div>
                            <img 
                              src={part.imageUrl} 
                              alt={`Location of ${part.partName}`}
                              className="w-full h-32 object-cover rounded-md border"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {!selectedMachine && (
            <Alert>
              <AlertDescription>
                Select a machine type above to view its parts and locations.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
