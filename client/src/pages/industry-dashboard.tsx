import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Item, RentalWithDetails } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, TrendingUp, ShoppingBag, DollarSign, Plus, LogOut, LayoutDashboard, PackageSearch, BarChart3 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import InventoryManagement from "@/components/inventory-management";
import RevenueAnalytics from "@/components/revenue-analytics";
import AddItemDialog from "@/components/add-item-dialog";

export default function IndustryDashboard() {
  const [, setLocation] = useLocation();
  const [showAddItem, setShowAddItem] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
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
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-3" data-testid="text-total-revenue">
                ${totalRevenue.toFixed(2)}
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
                ${thisMonthRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Current month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
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
        </Tabs>
      </div>

      <AddItemDialog open={showAddItem} onOpenChange={setShowAddItem} />
    </div>
  );
}
