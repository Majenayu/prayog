import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface TrackingMapProps {
  sessionId: string;
  isIndustry?: boolean;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

export function TrackingMap({ sessionId, isIndustry = false, onLocationUpdate }: TrackingMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const industryMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const [locationEnabled, setLocationEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<string>("");
  const [eta, setEta] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/tracking/session/${sessionId}`);
        if (response.ok) {
          const session = await response.json();

          if (session.userLat && session.userLng) {
            const userPos: [number, number] = [parseFloat(session.userLat), parseFloat(session.userLng)];
            if (userMarkerRef.current) {
              userMarkerRef.current.setLatLng(userPos);
            } else if (mapRef.current) {
              userMarkerRef.current = L.marker(userPos, {
                title: "Customer Location",
              }).addTo(mapRef.current);
            }
          }

          if (session.industryLat && session.industryLng) {
            const industryPos: [number, number] = [parseFloat(session.industryLat), parseFloat(session.industryLng)];
            if (industryMarkerRef.current) {
              industryMarkerRef.current.setLatLng(industryPos);
            } else if (mapRef.current) {
              industryMarkerRef.current = L.marker(industryPos, {
                title: "Delivery Location",
              }).addTo(mapRef.current);
            }
          }

          if (session.userLat && session.userLng && session.industryLat && session.industryLng) {
            await calculateRoute(
              [parseFloat(session.industryLat), parseFloat(session.industryLng)],
              [parseFloat(session.userLat), parseFloat(session.userLng)]
            );
          }

          if (session.distance) {
            setDistance(session.distance);
          }
          if (session.estimatedTime) {
            setEta(session.estimatedTime);
          }
        }
      } catch (error) {
        console.error("Error fetching tracking session:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionId]);

  const calculateRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const response = await fetch("/api/tracking/calculate-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startLat: start[0],
          startLng: start[1],
          endLat: end[0],
          endLng: end[1],
        }),
      });
      const data = await response.json();

      if (data.paths && data.paths.length > 0) {
        const coords = data.paths[0].points.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);

        if (routePolylineRef.current && mapRef.current) {
          mapRef.current.removeLayer(routePolylineRef.current);
        }

        if (mapRef.current) {
          routePolylineRef.current = L.polyline(coords, { color: "blue", weight: 5 }).addTo(mapRef.current);
          mapRef.current.fitBounds(routePolylineRef.current.getBounds());
        }

        const distanceKm = (data.paths[0].distance / 1000).toFixed(1);
        const timeMin = Math.round(data.paths[0].time / 60000);

        await fetch("/api/tracking/update-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            distance: distanceKm,
            estimatedTime: timeMin,
            routeData: data.paths[0],
          }),
        });
      }
    } catch (error) {
      console.error("Error calculating route:", error);
    }
  };

  const enableLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation: [number, number] = [latitude, longitude];
        setCurrentLocation(newLocation);
        setLocationEnabled(true);
        setLoading(false);

        if (mapRef.current) {
          mapRef.current.setView(newLocation, 14);
        }

        try {
          await fetch("/api/tracking/update-location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              latitude,
              longitude,
              isIndustry,
            }),
          });

          if (onLocationUpdate) {
            onLocationUpdate(latitude, longitude);
          }
        } catch (error) {
          console.error("Error updating location:", error);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setLoading(false);
        alert("Unable to access your location. Please enable location permissions.");
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
  };

  const disableLocation = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setLocationEnabled(false);
    setCurrentLocation(null);
  };

  const centerOnLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.setView(currentLocation, 15);
    } else {
      alert("Location not available");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
        <div>
          <CardTitle>Live Tracking</CardTitle>
          <CardDescription>Track delivery in real-time</CardDescription>
        </div>
        <div className="flex gap-2">
          {!locationEnabled ? (
            <Button size="sm" onClick={enableLocation} disabled={loading} data-testid="button-enable-location">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              <span className="ml-2">Enable Location</span>
            </Button>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={centerOnLocation} data-testid="button-center-location">
                <MapPin className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={disableLocation} data-testid="button-disable-location">
                Disable
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={mapContainerRef} className="h-64 w-full rounded-md" data-testid="map-container" />
        <div className="flex gap-4 text-sm">
          {distance && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Distance:</span>
              <Badge variant="secondary" data-testid="text-distance">{distance} km</Badge>
            </div>
          )}
          {eta > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">ETA:</span>
              <Badge variant="secondary" data-testid="text-eta">{eta} min</Badge>
            </div>
          )}
          {locationEnabled && (
            <div className="flex items-center gap-2">
              <Badge variant="default" data-testid="status-location">
                Location Active
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
