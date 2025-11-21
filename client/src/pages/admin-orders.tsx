import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Download, QrCode, Package, User, Building2, Calendar, DollarSign, LogOut } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
interface RentalWithDetails {
  id: string;
  itemId: string;
  userId: string;
  industryId: string;
  startDate: string;
  endDate: string;
  days: number;
  totalAmount: string;
  status: string;
  itemName?: string;
  itemImageUrl?: string;
  userName?: string;
  industryName?: string;
  pricePerDay?: string;
  healthReport?: any;
}

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<RentalWithDetails | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const { toast } = useToast();
  const { logout } = useAuth();

  const { data: orders, isLoading } = useQuery<RentalWithDetails[]>({
    queryKey: ['/api/admin/all-orders'],
  });

  const generateQrMutation = useMutation({
    mutationFn: async (rentalId: string) => {
      const response = await fetch(`/api/admin/generate-qr/${rentalId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate QR code');
      }
      return await response.json();
    },
    onSuccess: (data: { qrCodeUrl: string; qrData: any }) => {
      setQrCodeUrl(data.qrCodeUrl);
      setQrDialogOpen(true);
      toast({
        title: "QR Code Generated",
        description: "QR code has been generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate QR code",
        variant: "destructive",
      });
    },
  });

  const downloadQrCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `order-qr-${selectedOrder?.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Downloaded",
      description: "QR code has been downloaded",
    });
  };

  const filteredOrders = orders?.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.itemName?.toLowerCase().includes(searchLower) ||
      order.userName?.toLowerCase().includes(searchLower) ||
      order.industryName?.toLowerCase().includes(searchLower) ||
      order.id.toLowerCase().includes(searchLower)
    );
  }) || [];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-primary to-purple-600 rounded-lg p-2">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
            </div>
            <Button variant="ghost" onClick={handleLogout} data-testid="button-admin-logout">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">All Orders</h2>
          <p className="text-muted-foreground">
            View and manage all rental orders across the platform
          </p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID, item, user, or company..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-admin-search"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No orders found matching your search" : "No orders yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <Package className="h-5 w-5 text-primary" />
                        {order.itemName}
                      </CardTitle>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4" />
                          <span>Customer: {order.userName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4" />
                          <span>Company: {order.industryName}</span>
                        </div>
                      </CardDescription>
                    </div>
                    <Badge variant={order.status === 'active' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <p className="font-medium">Duration</p>
                        <p className="text-muted-foreground">{order.days} days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <p className="font-medium">Total Amount</p>
                        <p className="text-muted-foreground">{formatCurrency(parseFloat(order.totalAmount))}</p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Order ID</p>
                      <p className="text-muted-foreground font-mono text-xs">{order.id.substring(0, 8)}...</p>
                    </div>
                  </div>

                  {order.itemImageUrl && (
                    <div className="mb-4">
                      <img 
                        src={order.itemImageUrl} 
                        alt={order.itemName}
                        className="w-full h-48 object-cover rounded-md"
                        data-testid={`img-order-${order.id}`}
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedOrder(order);
                        generateQrMutation.mutate(order.id);
                      }}
                      disabled={generateQrMutation.isPending}
                      data-testid={`button-generate-qr-${order.id}`}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      {generateQrMutation.isPending && selectedOrder?.id === order.id ? "Generating..." : "Generate QR"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code Generated</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {qrCodeUrl && (
              <div className="flex justify-center">
                <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" data-testid="img-qr-code" />
              </div>
            )}
            <div className="text-sm text-muted-foreground text-center">
              <p>Scan this QR code to view order details</p>
              <p className="font-mono text-xs mt-2">Order: {selectedOrder?.id.substring(0, 12)}...</p>
            </div>
            <Button onClick={downloadQrCode} className="w-full" data-testid="button-download-qr">
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
