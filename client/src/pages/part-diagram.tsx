import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Wrench, Heart, Calendar } from "lucide-react";
import { Link } from "wouter";
import robotImage from "@assets/generated_images/IRB_1600_robot_main_body_763c8594.png";
import weldingTorchImage from "@assets/generated_images/Welding_torch_robot_part_8d09dbdf.png";
import cuttingToolImage from "@assets/generated_images/Cutting_tool_robot_part_0711d221.png";
import magneticGripperImage from "@assets/generated_images/Magnetic_gripper_robot_part_33f8af0b.png";
import vacuumGripperImage from "@assets/generated_images/Vacuum_gripper_robot_part_6c59963c.png";

interface ItemPart {
  id: string;
  itemId: string;
  partName: string;
  partNumber: string | null;
  description: string;
  health: number | null;
  isAvailable: boolean | null;
  positionX: number | null;
  positionY: number | null;
  imageUrl: string | null;
  currentRental?: {
    id: string;
    userId: string;
    status: string;
  } | null;
}

interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  machineType: string | null;
}

const PART_IMAGES: Record<string, string> = {
  "Welding Torch": weldingTorchImage,
  "Cutting Tool": cuttingToolImage,
  "Magnetic Gripper": magneticGripperImage,
  "Vacuum Gripper": vacuumGripperImage,
};

export default function PartDiagram() {
  const [, params] = useRoute("/parts/:itemId");
  const itemId = params?.itemId;

  const { data: item, isLoading: itemLoading } = useQuery<Item>({
    queryKey: [`/api/items/${itemId}`],
    enabled: !!itemId,
  });

  const { data: parts = [], isLoading: partsLoading } = useQuery<ItemPart[]>({
    queryKey: [`/api/items/${itemId}/parts`],
    enabled: !!itemId,
  });

  const isLoading = itemLoading || partsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading machine details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Machine Not Found</CardTitle>
            <CardDescription>The requested machine could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/"><Button data-testid="button-back-home">Back to Home</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allPartsAvailable = parts.every(p => p.isAvailable && !p.currentRental);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inventory
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle data-testid="text-machine-name">{item.name}</CardTitle>
                <CardDescription>{item.machineType || item.category}</CardDescription>
              </div>
              <Badge variant={allPartsAvailable ? "default" : "secondary"} data-testid="badge-machine-status">
                {allPartsAvailable ? "Fully Available" : "Parts Rented"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <img
                src={robotImage}
                alt={item.name}
                className={`w-full h-auto rounded-md ${!allPartsAvailable ? "opacity-50 grayscale" : ""}`}
                data-testid="img-machine"
              />
              <div className="absolute inset-0 pointer-events-none">
                {parts.map((part, index) => {
                  const x = part.positionX || (20 + index * 15);
                  const y = part.positionY || (20 + index * 15);
                  const isAvailable = part.isAvailable && !part.currentRental;

                  return (
                    <div
                      key={part.id}
                      className="absolute pointer-events-auto"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div className="relative group">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isAvailable ? "bg-green-500" : "bg-red-500"
                          } animate-pulse cursor-pointer`}
                          data-testid={`marker-part-${part.id}`}
                        />
                        <div
                          className={`absolute z-10 w-1 ${
                            isAvailable ? "bg-green-500" : "bg-red-500"
                          }`}
                          style={{
                            left: "50%",
                            top: "100%",
                            height: "30px",
                            transform: "translateX(-50%)",
                          }}
                        />
                        <div
                          className="absolute z-20 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap"
                          style={{ top: "calc(100% + 35px)" }}
                        >
                          {part.partName}
                          <br />
                          Health: {part.health || 100}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>{item.description}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Machine Parts</CardTitle>
              <CardDescription>
                {allPartsAvailable
                  ? "All parts available for rent"
                  : `${parts.filter(p => !p.isAvailable || p.currentRental).length} of ${parts.length} parts currently rented`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {parts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No parts configured for this machine
                </p>
              ) : (
                parts.map((part) => {
                  const isAvailable = part.isAvailable && !part.currentRental;
                  const partImage = PART_IMAGES[part.partName] || null;

                  return (
                    <Card
                      key={part.id}
                      className={`${!isAvailable ? "opacity-60" : ""}`}
                      data-testid={`card-part-${part.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {partImage && (
                            <img
                              src={partImage}
                              alt={part.partName}
                              className={`w-20 h-20 object-contain rounded ${!isAvailable ? "grayscale" : ""}`}
                              data-testid={`img-part-${part.id}`}
                            />
                          )}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <h3 className="font-semibold" data-testid={`text-part-name-${part.id}`}>
                                {part.partName}
                              </h3>
                              <Badge variant={isAvailable ? "default" : "secondary"} data-testid={`badge-part-status-${part.id}`}>
                                {isAvailable ? "Available" : "Rented"}
                              </Badge>
                            </div>
                            {part.partNumber && (
                              <p className="text-xs text-muted-foreground">
                                Part #: {part.partNumber}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              {part.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm flex-wrap">
                              <div className="flex items-center gap-1">
                                <Heart className={`w-4 h-4 ${isAvailable ? "text-green-600" : "text-red-600"}`} />
                                <span className={isAvailable ? "text-green-600" : "text-red-600"} data-testid={`text-part-health-${part.id}`}>
                                  {part.health || 100}% Health
                                </span>
                              </div>
                              {!isAvailable && part.currentRental && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Calendar className="w-4 h-4" />
                                  <span>Currently Rented</span>
                                </div>
                              )}
                            </div>
                            {isAvailable && (
                              <Button size="sm" className="mt-2" data-testid={`button-rent-${part.id}`}>
                                <Wrench className="w-3 h-3 mr-1" />
                                Rent This Part
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm">Available - Part is ready to rent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm">Unavailable - Part is currently rented</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
