import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Item, RentalWithDetails } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, TrendingUp, ShoppingBag, IndianRupee, Plus, LogOut, LayoutDashboard, PackageSearch, BarChart3, Bell, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import InventoryManagement from "@/components/inventory-management";
import RevenueAnalytics from "@/components/revenue-analytics";
import AddItemDialog from "@/components/add-item-dialog";
import { formatCurrencyShort } from "@/lib/currency";
import { TrackingMap } from "@/components/TrackingMap";

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

export default function IndustryDashboard() {
  const [, setLocation] = useLocation();
  const [showAddItem, setShowAddItem] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTracking, setSelectedTracking] = useState<string | null>(null);
  const { user, logout: authLogout } = useAuth();

  if (!user || user.role !== 'industry') {
    return null;
  }

  const { data: items = [] } = useQuery<Item[]>({
    queryKey: ['/api/items/my-items'],
  });

  const { data: rentals = [] } = useQuery<RentalWithDetails[]>({
    queryKey: ['/api/rentals/my-rentals'],
  });

  const { data: trackingSessions = [] } = useQuery<TrackingSession[]>({
    queryKey: ['/api/tracking/industry-sessions'],
  });

  const handleLogout = async () => {
    await authLogout();
    setLocation("/");
  };

  const activeRentals = rentals.filter(r => r.status === 'active');
  const totalRevenue = rentals.reduce((sum, r) => sum + parseFloat(r.totalAmount), 0);
  const thisMonthRevenue = rentals
    .filter(r => {
      const rentalDate = new Date(r.createdAt!);
      const now = new Date();
      return rentalDate.getMonth() === now.getMonth() && 
             rentalDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, r) => sum + parseFloat(r.totalAmount), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-primary to-purple-600 rounded-lg p-2">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  RentHub
                </h1>
                <p className="text-xs text-muted-foreground">Industry Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowAddItem(true)}
                className="gap-2"
                data-testid="button-add-item"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Item</span>
              </Button>
              <ThemeToggle />
              <Button
                variant="ghost"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user.companyName || user.username}!
          </h2>
          <p className="text-muted-foreground">
            Manage your inventory and track your rental business
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary" data-testid="text-total-items">
                {items.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Listed products
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-2" data-testid="text-active-rentals">
                {activeRentals.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently rented
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-3" data-testid="text-total-revenue">
                {formatCurrencyShort(totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All-time earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-4" data-testid="text-month-revenue">
                {formatCurrencyShort(thisMonthRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Current month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2" data-testid="tab-overview">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2" data-testid="tab-inventory">
              <PackageSearch className="h-4 w-4" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="gap-2" data-testid="tab-revenue">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Revenue</span>
            </TabsTrigger>
            <TabsTrigger value="track" className="gap-2" data-testid="tab-track">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Track</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2" data-testid="tab-notifications">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {rentals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No rental activity yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {rentals.slice(0, 5).map((rental) => (
                        <div 
                          key={rental.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="space-y-1">
                            <p className="font-medium text-sm">{rental.itemName}</p>
                            <p className="text-xs text-muted-foreground">
                              {rental.userName} • {rental.days} days
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${rental.totalAmount}</p>
                            <Badge variant={rental.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                              {rental.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No items added yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.slice(0, 5).map((item) => (
                        <div 
                          key={item.id} 
                          className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">${item.pricePerDay}/day</p>
                            <Badge 
                              variant={item.availableQuantity > 0 ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {item.availableQuantity} avail
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryManagement items={items} />
          </TabsContent>

          <TabsContent value="revenue">
            <RevenueAnalytics rentals={rentals} items={items} />
          </TabsContent>

          <TabsContent value="track">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Deliveries</CardTitle>
                </CardHeader>
                <CardContent>
                  {trackingSessions.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No active delivery tracking sessions</p>
                      <p className="text-sm mt-2">Tracking sessions are started by customers for their active rentals</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {trackingSessions.map((session) => {
                        const rental = rentals.find(r => r.id === session.rentalId);
                        return (
                          <Card key={session.id} className="hover-elevate">
                            <CardHeader>
                              <h3 className="font-semibold text-sm">
                                {rental?.itemName || 'Equipment Delivery'}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                Customer: {rental?.userName || 'Unknown'}
                              </p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {session.distance && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Distance:</span>
                                  <Badge variant="secondary">{session.distance} km</Badge>
                                </div>
                              )}
                              {session.estimatedTime && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">ETA:</span>
                                  <Badge variant="secondary">{session.estimatedTime} min</Badge>
                                </div>
                              )}
                              <Button
                                size="sm"
                                variant="default"
                                className="w-full gap-2"
                                onClick={() => setSelectedTracking(session.id)}
                                data-testid={`button-view-tracking-${session.id}`}
                              >
                                <MapPin className="h-4 w-4" />
                                View on Map
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedTracking && (
                <TrackingMap sessionId={selectedTracking} isIndustry={true} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Activity Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rentals.length === 0 && items.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No activity yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[...items.map(item => ({
                        type: 'item_added',
                        message: `Item "${item.name}" was added to inventory`,
                        timestamp: item.createdAt || new Date().toISOString(),
                        icon: Package
                      })),
                      ...rentals.map(rental => {
                        const endDate = rental.endDate ? new Date(rental.endDate) : null;
                        const daysUntilReturn = endDate ? Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
                        return [
                          {
                            type: 'order_received',
                            message: `${rental.userName} ordered "${rental.itemName}"`,
                            timestamp: rental.createdAt || new Date().toISOString(),
                            icon: ShoppingBag
                          },
                          ...(rental.status === 'active' && endDate && daysUntilReturn <= 3 && daysUntilReturn > 0 ? [{
                            type: 'return_reminder',
                            message: `"${rental.itemName}" return due in ${daysUntilReturn} day${daysUntilReturn !== 1 ? 's' : ''}`,
                            timestamp: rental.endDate || new Date().toISOString(),
                            icon: TrendingUp
                          }] : []),
                          ...(rental.status === 'completed' ? [{
                            type: 'item_returned',
                            message: `"${rental.itemName}" was returned by ${rental.userName}`,
                            timestamp: rental.endDate || new Date().toISOString(),
                            icon: Package
                          }] : [])
                        ];
                      }).flat()]
                        .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
                        .slice(0, 20)
                        .map((notification, index) => {
                          const Icon = notification.icon;
                          const timeAgo = notification.timestamp ? 
                            new Date(notification.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'Recently';
                          
                          return (
                            <div 
                              key={index}
                              className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover-elevate"
                              data-testid={`notification-${notification.type}-${index}`}
                            >
                              <div className="mt-1 p-2 rounded-lg bg-primary/10">
                                <Icon className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{notification.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AddItemDialog open={showAddItem} onOpenChange={setShowAddItem} />
    </div>
  );
}
