import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ItemWithIndustry } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ShoppingCart, LogOut, Package, Activity, IndianRupee, ArrowLeftRight, Wrench, CheckCircle2, AlertCircle, TrendingUp, Calendar, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { formatCurrency } from "@/lib/currency";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FakeDialogProps {
  item: ItemWithIndustry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function FakeHealthReportDialog({ item, open, onOpenChange }: FakeDialogProps) {
  const reportData = useMemo(() => {
    const healthScore = Math.floor(Math.random() * 20) + 75;
    const efficiency = Math.floor(Math.random() * 15) + 82;
    const partsCondition = Math.floor(Math.random() * 25) + 70;
    
    const lastInspection = new Date();
    lastInspection.setDate(lastInspection.getDate() - Math.floor(Math.random() * 30));
    
    const nextMaintenance = new Date();
    nextMaintenance.setDate(nextMaintenance.getDate() + Math.floor(Math.random() * 60) + 30);
    
    const maintenanceHours = Math.floor(Math.random() * 50) + 50;
    
    return {
      healthScore,
      efficiency,
      partsCondition,
      lastInspection,
      nextMaintenance,
      maintenanceHours
    };
  }, [item.id, open]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Health Report: {item.name}</DialogTitle>
          <DialogDescription>Comprehensive condition assessment for industrial equipment</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="font-semibold text-lg">Overall Health Score</p>
                <p className="text-sm text-muted-foreground">Excellent condition</p>
              </div>
            </div>
            <div className="text-4xl font-bold text-green-500">{reportData.healthScore}%</div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Operational Efficiency</span>
                <span className="text-sm font-semibold">{reportData.efficiency}%</span>
              </div>
              <Progress value={reportData.efficiency} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Parts Condition</span>
                <span className="text-sm font-semibold">{reportData.partsCondition}%</span>
              </div>
              <Progress value={reportData.partsCondition} className="h-2" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Last Inspection
              </div>
              <p className="font-semibold">{reportData.lastInspection.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" />
                Next Maintenance
              </div>
              <p className="font-semibold">{reportData.nextMaintenance.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              Maintenance Recommendations
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Hydraulic fluid levels optimal</li>
              <li>• Check belt tension after {reportData.maintenanceHours} operating hours</li>
              <li>• Replace air filters in next scheduled maintenance</li>
              <li>• Lubrication system functioning normally</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FakeAppraisalDialog({ item, open, onOpenChange }: FakeDialogProps) {
  const appraisalData = useMemo(() => {
    const baseValue = parseFloat(item.pricePerDay) * 300;
    const estimatedValue = Math.floor(baseValue * (0.9 + Math.random() * 0.3));
    const marketDemand = ['High', 'Very High', 'Moderate'][Math.floor(Math.random() * 3)];
    const appreciation = Math.floor(Math.random() * 15) - 5;
    const roi = Math.floor(Math.random() * 10) + 15;
    
    return {
      estimatedValue,
      marketDemand,
      appreciation,
      roi
    };
  }, [item.id, item.pricePerDay, open]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Market Value Appraisal: {item.name}</DialogTitle>
          <DialogDescription>Professional valuation for industrial machinery</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <IndianRupee className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg">Estimated Market Value</p>
                <p className="text-sm text-muted-foreground">Based on current market conditions</p>
              </div>
            </div>
            <div className="text-4xl font-bold text-primary">{formatCurrency(appraisalData.estimatedValue)}</div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Market Demand
              </div>
              <p className="font-semibold text-lg">{appraisalData.marketDemand}</p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="text-sm text-muted-foreground">Daily Rental Rate</div>
              <p className="font-semibold text-lg">{formatCurrency(item.pricePerDay)}</p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="text-sm text-muted-foreground">12-Month Trend</div>
              <p className={`font-semibold text-lg ${appraisalData.appreciation >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {appraisalData.appreciation >= 0 ? '+' : ''}{appraisalData.appreciation}%
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Valuation Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm">Base Equipment Value</span>
                <span className="font-semibold">{formatCurrency(Math.floor(appraisalData.estimatedValue * 0.7))}</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm">Market Adjustment</span>
                <span className="font-semibold">{formatCurrency(Math.floor(appraisalData.estimatedValue * 0.15))}</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm">Condition Premium</span>
                <span className="font-semibold">{formatCurrency(Math.floor(appraisalData.estimatedValue * 0.15))}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Market Insights
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Strong demand for {item.category} equipment in industrial sector</li>
              <li>• Comparable units selling at {formatCurrency(Math.floor(appraisalData.estimatedValue * 0.95))} - {formatCurrency(Math.floor(appraisalData.estimatedValue * 1.05))}</li>
              <li>• Expected ROI: {appraisalData.roi}% annually through rentals</li>
              <li>• Equipment age and maintenance history support current valuation</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RentalBookingDialog({ item, open, onOpenChange }: FakeDialogProps) {
  const [daysInput, setDaysInput] = useState('1');
  const { toast } = useToast();

  const days = useMemo(() => {
    const parsed = parseInt(daysInput);
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
  }, [daysInput]);

  const totalPrice = useMemo(() => {
    return parseFloat(item.pricePerDay) * days;
  }, [item.pricePerDay, days]);

  const createRentalMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/rentals', {
        itemId: item.id,
        days,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rentals/my-rentals'] });
      toast({
        title: "Booking confirmed!",
        description: `Successfully booked ${item.name} for ${days} day${days > 1 ? 's' : ''}.`,
      });
      onOpenChange(false);
      setDaysInput('1');
    },
    onError: (error: any) => {
      toast({
        title: "Booking failed",
        description: error.message || "Failed to book this item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleConfirmRental = () => {
    if (days < 1) {
      toast({
        title: "Invalid duration",
        description: "Please select at least 1 day.",
        variant: "destructive",
      });
      return;
    }
    createRentalMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book Equipment Rental</DialogTitle>
          <DialogDescription>Complete your rental booking for {item.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{item.name}</h4>
              <p className="text-sm text-muted-foreground truncate">{item.category}</p>
              <p className="text-sm font-medium mt-1">
                {formatCurrency(item.pricePerDay)}/day
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rental-days">Rental Duration (days)</Label>
            <Input
              id="rental-days"
              type="number"
              min="1"
              step="1"
              value={daysInput}
              onChange={(e) => setDaysInput(e.target.value)}
              onBlur={() => {
                const parsed = parseInt(daysInput, 10);
                const sanitized = isNaN(parsed) || parsed < 1 ? 1 : parsed;
                setDaysInput(String(sanitized));
              }}
              disabled={createRentalMutation.isPending}
              data-testid="input-rental-days"
            />
            <p className="text-xs text-muted-foreground">Minimum 1 day rental required</p>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Daily Rate</span>
              <span className="font-medium">{formatCurrency(item.pricePerDay)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">{days} day{days > 1 ? 's' : ''}</span>
            </div>
            <div className="pt-2 border-t flex justify-between">
              <span className="font-semibold">Total Amount</span>
              <span className="font-bold text-lg text-primary">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createRentalMutation.isPending}
            data-testid="button-cancel-rental"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmRental}
            disabled={createRentalMutation.isPending}
            data-testid="button-confirm-rental"
          >
            {createRentalMutation.isPending ? "Booking..." : "Confirm Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { user, logout: authLogout } = useAuth();
  const [healthReportOpen, setHealthReportOpen] = useState(false);
  const [appraisalOpen, setAppraisalOpen] = useState(false);
  const [rentalDialogOpen, setRentalDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemWithIndustry | null>(null);

  const { data: items, isLoading } = useQuery<ItemWithIndustry[]>({
    queryKey: ['/api/items'],
  });

  const handleLogout = async () => {
    await authLogout();
    setLocation("/");
  };

  const categories = items
    ? Array.from(new Set(items.map(item => item.category))).sort()
    : [];

  const filteredItems = items?.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  const availableItems = filteredItems.filter(item => item.availableQuantity > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-primary to-purple-600 rounded-lg p-2">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                RentHub
              </h1>
            </div>

            <div className="flex-1 max-w-2xl mx-4 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search items, categories..."
                  className="pl-10 h-11"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                onClick={() => setLocation("/my-rentals")}
                className="gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">My Rentals</span>
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation("/repairs")}
                className="gap-2"
              >
                <Wrench className="h-4 w-4" />
                <span className="hidden sm:inline">Repairs</span>
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation("/exchanges")}
                className="gap-2"
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span className="hidden sm:inline">Exchanges</span>
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

          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search items..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-mobile"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Available for Rent</h2>
          <p className="text-muted-foreground">
            Browse our marketplace • {availableItems.length} items available
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className="rounded-full"
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : availableItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-muted rounded-full p-6 mb-4">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground max-w-md">
              {searchTerm 
                ? "Try adjusting your search terms" 
                : "No items are currently available for rent"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {availableItems.map((item) => (
              <Card 
                key={item.id} 
                className="overflow-hidden hover-elevate transition-all duration-200 group"
                data-testid={`card-item-${item.id}`}
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    data-testid={`img-item-${item.id}`}
                  />
                  <Badge 
                    className="absolute top-3 right-3 bg-green-500 text-white border-0"
                    data-testid={`badge-available-${item.id}`}
                  >
                    Available
                  </Badge>
                </div>

                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 
                      className="font-semibold text-lg line-clamp-1"
                      data-testid={`text-item-name-${item.id}`}
                    >
                      {item.name}
                    </h3>
                  </div>
                  <Badge variant="secondary" className="w-fit text-xs">
                    {item.category}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p 
                    className="text-sm text-muted-foreground line-clamp-2"
                    data-testid={`text-description-${item.id}`}
                  >
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(item.pricePerDay)}
                      </div>
                      <div className="text-xs text-muted-foreground">per day</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {item.availableQuantity} available
                      </div>
                      <div className="text-xs text-muted-foreground">
                        of {item.quantity}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 text-xs gap-1"
                      onClick={() => {
                        setSelectedItem(item);
                        setHealthReportOpen(true);
                      }}
                    >
                      <Activity className="h-3 w-3" />
                      Health
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 text-xs gap-1"
                      onClick={() => {
                        setSelectedItem(item);
                        setAppraisalOpen(true);
                      }}
                    >
                      <IndianRupee className="h-3 w-3" />
                      Value
                    </Button>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => {
                      setSelectedItem(item);
                      setRentalDialogOpen(true);
                    }}
                    data-testid={`button-rent-${item.id}`}
                  >
                    Rent Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Dialogs */}
      {selectedItem && (
        <>
          <FakeHealthReportDialog 
            item={selectedItem}
            open={healthReportOpen}
            onOpenChange={setHealthReportOpen}
          />
          <FakeAppraisalDialog 
            item={selectedItem}
            open={appraisalOpen}
            onOpenChange={setAppraisalOpen}
          />
          <RentalBookingDialog
            item={selectedItem}
            open={rentalDialogOpen}
            onOpenChange={setRentalDialogOpen}
          />
        </>
      )}
    </div>
  );
}
