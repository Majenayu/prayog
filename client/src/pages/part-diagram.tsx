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
  location: string | null;
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

  const partsByLocation: Record<string, ItemPart | undefined> = {
    'top-left': parts.find(p => p.location === 'top-left'),
    'top-right': parts.find(p => p.location === 'top-right'),
    'middle-left': parts.find(p => p.location === 'middle-left'),
    'middle-right': parts.find(p => p.location === 'middle-right'),
    'bottom-left': parts.find(p => p.location === 'bottom-left'),
    'bottom-right': parts.find(p => p.location === 'bottom-right'),
  };

  const renderPartCard = (location: string, label: string) => {
    const part = partsByLocation[location];
    const isAvailable = part ? (part.isAvailable && !part.currentRental) : false;
    const partImage = part ? (PART_IMAGES[part.partName] || part.imageUrl) : null;

    return (
      <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        {part ? (
          <>
            {partImage && (
              <img
                src={partImage}
                alt={part.partName}
                className={`w-24 h-24 object-contain rounded ${!isAvailable ? "grayscale opacity-60" : ""}`}
                data-testid={`img-part-${location}`}
              />
            )}
            <div className="text-center space-y-1 w-full">
              <div className="font-semibold text-sm">{part.partName}</div>
              <Badge variant={isAvailable ? "default" : "secondary"} className="text-xs">
                {isAvailable ? "Available" : "Rented"}
              </Badge>
              <div className="flex items-center justify-center gap-1 text-xs">
                <Heart className={`w-3 h-3 ${isAvailable ? "text-green-600" : "text-red-600"}`} />
                <span className={isAvailable ? "text-green-600" : "text-red-600"}>
                  {part.health || 100}%
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="w-24 h-24 flex items-center justify-center text-muted-foreground text-xs">
            No Part
          </div>
        )}
      </div>
    );
  };

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

      <Card className="mb-6">
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
          <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-4">
              {renderPartCard('top-left', 'Top Left')}
              {renderPartCard('middle-left', 'Middle Left')}
              {renderPartCard('bottom-left', 'Bottom Left')}
            </div>

            <div className="flex items-center justify-center">
              <img
                src={robotImage}
                alt={item.name}
                className={`w-full h-auto rounded-md max-w-xs ${!allPartsAvailable ? "opacity-60" : ""}`}
                data-testid="img-machine"
              />
            </div>

            <div className="space-y-4">
              {renderPartCard('top-right', 'Top Right')}
              {renderPartCard('middle-right', 'Middle Right')}
              {renderPartCard('bottom-right', 'Bottom Right')}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
