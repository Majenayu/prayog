import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ItemWithIndustry } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ShoppingCart, LogOut, Package, Activity, DollarSign, ArrowLeftRight, Wrench, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { HealthReportDialog } from "@/components/health-report-dialog";
import { AppraisalDialog } from "@/components/appraisal-dialog";
import { AIAppraisalDialog } from "@/components/ai-appraisal-dialog";
import { MachinePartsViewer } from "@/components/machine-parts-viewer";
import { MachineDiagramViewer } from "@/components/machine-diagram-viewer";
import { formatCurrency } from "@/lib/currency";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { user, logout: authLogout } = useAuth();
  const [healthReportOpen, setHealthReportOpen] = useState(false);
  const [appraisalOpen, setAppraisalOpen] = useState(false);
  const [aiAppraisalOpen, setAiAppraisalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [selectedItemName, setSelectedItemName] = useState<string>("");

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
              <MachineDiagramViewer />
              <MachinePartsViewer />
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
                        setSelectedItemId(item.id);
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
                        setSelectedItemId(item.id);
                        setAppraisalOpen(true);
                      }}
                    >
                      <DollarSign className="h-3 w-3" />
                      Value
                    </Button>
                  </div>
                  
                  {user?.role === "user" && (
                    <Button 
                      size="sm"
                      className="w-full text-xs gap-1 mt-2"
                      onClick={() => {
                        setSelectedItemId(item.id);
                        setSelectedItemName(item.name);
                        setAiAppraisalOpen(true);
                      }}
                    >
                      <Sparkles className="h-3 w-3" />
                      AI Analysis
                    </Button>
                  )}
                </CardContent>

                <CardFooter>
                  <Button 
                    className="w-full" 
                    size="lg"
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
      {selectedItemId && (
        <>
          <HealthReportDialog 
            itemId={selectedItemId}
            open={healthReportOpen}
            onOpenChange={setHealthReportOpen}
          />
          <AppraisalDialog 
            itemId={selectedItemId}
            open={appraisalOpen}
            onOpenChange={setAppraisalOpen}
          />
          <AIAppraisalDialog 
            itemId={selectedItemId}
            itemName={selectedItemName}
            open={aiAppraisalOpen}
            onOpenChange={setAiAppraisalOpen}
          />
        </>
      )}
    </div>
  );
}
