import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, User, Building2, Calendar, DollarSign, Activity } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";

interface QRData {
  rentalId: string;
  userId: string;
  userName: string;
  industryId: string;
  industryName: string;
  itemId: string;
  itemName: string;
  itemImageUrl: string;
  startDate: string;
  endDate: string;
  days: number;
  pricePerDay: string;
  totalAmount: string;
  status: string;
  healthReport?: {
    overallCondition: string;
    conditionScore: number;
    visualInspection?: string;
    functionalTest?: string;
  };
}

export default function QRViewer() {
  const [, params] = useRoute("/qr/:rentalId");
  const rentalId = params?.rentalId;

  const { data: qrData, isLoading, error } = useQuery<QRData>({
    queryKey: ['/api/qr', rentalId],
    enabled: !!rentalId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !qrData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Order not found or QR code is invalid</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getConditionColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-primary to-purple-600 rounded-lg p-2">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Order Details</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl">
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="flex items-center gap-2 mb-2 text-2xl">
                  <Package className="h-6 w-6 text-primary" />
                  {qrData.itemName}
                </CardTitle>
                <CardDescription>
                  Order ID: <span className="font-mono">{qrData.rentalId.substring(0, 12)}...</span>
                </CardDescription>
              </div>
              <Badge variant={qrData.status === 'active' ? 'default' : 'secondary'} className="text-base px-4 py-1">
                {qrData.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {qrData.itemImageUrl && (
              <div className="rounded-lg overflow-hidden">
                <img 
                  src={qrData.itemImageUrl} 
                  alt={qrData.itemName}
                  className="w-full h-64 object-cover"
                  data-testid="img-qr-item"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Customer Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Customer Name</p>
                      <p className="font-medium" data-testid="text-customer-name">{qrData.userName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Rental Company</p>
                      <p className="font-medium" data-testid="text-industry-name">{qrData.industryName}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Rental Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Rental Period</p>
                      <p className="font-medium" data-testid="text-rental-period">{qrData.days} days</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(qrData.startDate), 'MMM dd, yyyy')} - {qrData.endDate && format(new Date(qrData.endDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-medium text-lg" data-testid="text-total-amount">{formatCurrency(parseFloat(qrData.totalAmount))}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(parseFloat(qrData.pricePerDay))}/day
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {qrData.healthReport && (
              <div className="space-y-4 pt-6 border-t">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Equipment Health Report
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Overall Condition</p>
                        <p className={`text-2xl font-bold capitalize ${getConditionColor(qrData.healthReport.conditionScore)}`} data-testid="text-health-condition">
                          {qrData.healthReport.overallCondition}
                        </p>
                        <div className="mt-2">
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full ${qrData.healthReport.conditionScore >= 80 ? 'bg-green-600' : qrData.healthReport.conditionScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                              style={{ width: `${qrData.healthReport.conditionScore}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{qrData.healthReport.conditionScore}/100</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-3">
                    {qrData.healthReport.visualInspection && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Visual Inspection</p>
                        <p className="text-sm" data-testid="text-visual-inspection">{qrData.healthReport.visualInspection}</p>
                      </div>
                    )}
                    {qrData.healthReport.functionalTest && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Functional Test</p>
                        <p className="text-sm" data-testid="text-functional-test">{qrData.healthReport.functionalTest}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 border-t text-center text-sm text-muted-foreground">
              <p>This QR code contains verified rental information</p>
              <p className="mt-1">Data is immutable and cannot be altered</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
