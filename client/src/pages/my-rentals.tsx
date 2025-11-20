import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Calendar, ArrowLeft, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { TrackingMap } from "@/components/TrackingMap";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Rental {
  id: string;
  itemId: string;
  userId: string;
  industryId: string;
  startDate: string;
  endDate: string | null;
  days: number;
  totalAmount: string;
  status: string;
  createdAt: string;
  itemName?: string;
  userName?: string;
  imageUrl?: string;
}

interface TrackingSession {
  id: string;
  rentalId: string;
  userId: string;
  industryId: string;
  itemId: string;
  status: string;
  userLat: string | null;
  userLng: string | null;
  industryLat: string | null;
  industryLng: string | null;
  distance: string | null;
  estimatedTime: number | null;
}

export default function MyRentals() {
  const [, setLocation] = useLocation();
  const [selectedTracking, setSelectedTracking] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: rentals, isLoading } = useQuery<Rental[]>({
    queryKey: ['/api/rentals/my-rentals'],
  });

  const { data: trackingSessions } = useQuery<TrackingSession[]>({
    queryKey: ['/api/tracking/user-sessions'],
  });

  const startTrackingMutation = useMutation({
    mutationFn: async (rentalId: string) => {
      return await apiRequest(`/api/tracking/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rentalId }),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tracking/user-sessions'] });
      setSelectedTracking(data.id);
      toast({
        title: "Tracking Started",
        description: "Live tracking has been enabled for this rental.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start tracking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const activeRentals = rentals?.filter(r => r.status === 'active') || [];
  const pastRentals = rentals?.filter(r => r.status !== 'active') || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/dashboard")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2 ml-auto">
              <div className="bg-gradient-to-r from-primary to-purple-600 rounded-lg p-2">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                My Rentals
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Active Rentals */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Active Rentals</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeRentals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-muted rounded-full p-6 mb-4">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No active rentals</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                You don't have any active equipment rentals at the moment.
              </p>
              <Button onClick={() => setLocation("/dashboard")}>
                Browse Equipment
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeRentals.map((rental) => {
                  const session = trackingSessions?.find(s => s.rentalId === rental.id);
                  return (
                    <Card key={rental.id} className="overflow-hidden" data-testid={`card-rental-${rental.id}`}>
                      {rental.imageUrl && (
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          <img
                            src={rental.imageUrl}
                            alt={rental.itemName || 'Rental item'}
                            className="w-full h-full object-cover"
                          />
                          <Badge className="absolute top-3 right-3 bg-green-500 text-white border-0">
                            Active
                          </Badge>
                        </div>
                      )}
                      
                      <CardHeader>
                        <h3 className="font-semibold text-lg" data-testid={`text-rental-name-${rental.id}`}>
                          {rental.itemName || 'Equipment'}
                        </h3>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(rental.startDate).toLocaleDateString()} - 
                            {rental.endDate ? new Date(rental.endDate).toLocaleDateString() : 'Ongoing'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Package className="h-4 w-4" />
                          <span>{rental.days} day{rental.days > 1 ? 's' : ''}</span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm text-muted-foreground">Total Amount</span>
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(rental.totalAmount)}
                          </span>
                        </div>

                        <div className="pt-2">
                          {session ? (
                            <Button
                              size="sm"
                              variant="default"
                              className="w-full gap-2"
                              onClick={() => setSelectedTracking(session.id)}
                              data-testid={`button-view-tracking-${rental.id}`}
                            >
                              <MapPin className="h-4 w-4" />
                              View Live Tracking
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full gap-2"
                              onClick={() => startTrackingMutation.mutate(rental.id)}
                              disabled={startTrackingMutation.isPending}
                              data-testid={`button-start-tracking-${rental.id}`}
                            >
                              <MapPin className="h-4 w-4" />
                              Start Tracking
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {selectedTracking && (
                <div className="mt-8">
                  <TrackingMap sessionId={selectedTracking} isIndustry={false} />
                </div>
              )}
            </div>
          )}
        </section>

        {/* Past Rentals */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Past Rentals</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pastRentals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No past rentals to display.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastRentals.map((rental) => (
                <Card key={rental.id} className="overflow-hidden opacity-75" data-testid={`card-rental-${rental.id}`}>
                  {rental.imageUrl && (
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <img
                        src={rental.imageUrl}
                        alt={rental.itemName || 'Rental item'}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-3 right-3 bg-muted text-muted-foreground border-0">
                        {rental.status}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader>
                    <h3 className="font-semibold text-lg">
                      {rental.itemName || 'Equipment'}
                    </h3>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(rental.startDate).toLocaleDateString()} - 
                        {rental.endDate ? new Date(rental.endDate).toLocaleDateString() : 'Ongoing'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>{rental.days} day{rental.days > 1 ? 's' : ''}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Total Amount</span>
                      <span className="text-lg font-bold">
                        {formatCurrency(rental.totalAmount)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
