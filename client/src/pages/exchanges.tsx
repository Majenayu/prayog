import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftRight, DollarSign, Package, ArrowLeft } from "lucide-react";
import { ExchangeWithDetails } from "@shared/schema";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ExchangesPage() {
  const [, setLocation] = useLocation();

  const { data: exchanges = [], isLoading } = useQuery<ExchangeWithDetails[]>({
    queryKey: ['/api/exchanges/my-exchanges'],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(value));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-primary to-purple-600 rounded-lg p-2">
                  <ArrowLeftRight className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold">Exchange Marketplace</h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Your Exchange Offers</h2>
          <p className="text-muted-foreground">
            Trade equipment or sell for cash • {exchanges.length} active offers
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : exchanges.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ArrowLeftRight className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Exchange Offers Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start trading your equipment with other businesses
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {exchanges.map((exchange) => (
              <Card key={exchange.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ArrowLeftRight className="h-5 w-5" />
                        {exchange.exchangeType === 'item_for_item' ? 'Item Exchange' :
                         exchange.exchangeType === 'item_for_cash' ? 'Sell for Cash' : 'Mixed Exchange'}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Status: <Badge className={getStatusColor(exchange.status)}>
                          {exchange.status.toUpperCase()}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Offered Item */}
                  <div className="space-y-2">
                    <div className="text-sm font-semibold flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Offering:
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <div className="font-medium">{exchange.offeredItem?.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {exchange.offeredItem?.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {/* Requested Item or Cash */}
                  {exchange.requestedItem ? (
                    <div className="space-y-2">
                      <div className="text-sm font-semibold flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Requesting:
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <div className="font-medium">{exchange.requestedItem.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {exchange.requestedItem.category}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-sm font-semibold flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Selling Price:
                      </div>
                      <div className="bg-primary/10 p-3 rounded-md border-2 border-primary">
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(exchange.cashAmount || "0")}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {exchange.notes && (
                    <>
                      <Separator />
                      <div>
                        <div className="text-sm font-semibold mb-2">Notes:</div>
                        <p className="text-sm text-muted-foreground">{exchange.notes}</p>
                      </div>
                    </>
                  )}

                  {/* Participants */}
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Offered by</div>
                      <div className="font-medium">{exchange.offererName}</div>
                    </div>
                    {exchange.receiverName && (
                      <div>
                        <div className="text-muted-foreground">Receiver</div>
                        <div className="font-medium">{exchange.receiverName}</div>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="gap-2">
                  {exchange.status === 'pending' && (
                    <>
                      <Button variant="outline" className="flex-1">
                        Cancel Offer
                      </Button>
                      <Button className="flex-1">
                        View Details
                      </Button>
                    </>
                  )}
                  {exchange.status === 'accepted' && (
                    <Button className="w-full">Complete Exchange</Button>
                  )}
                  {exchange.status === 'completed' && (
                    <Badge className="w-full justify-center py-2">Exchange Completed</Badge>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
