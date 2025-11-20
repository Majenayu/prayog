import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ArrowLeftRight, DollarSign, Package, ArrowLeft, Upload, Sparkles, TrendingDown, AlertCircle, CheckCircle, Image as ImageIcon } from "lucide-react";
import { ExchangeWithDetails } from "@shared/schema";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface AIAnalysisResult {
  productName: string;
  productType: string;
  manufacturer: string;
  partNumber: string;
  visualCondition: string;
  conditionScore: number;
  detectedIssues: string[];
  originalPrice: number;
  purchaseDate: string;
  materialType: string;
  remainingUsefulLife: string;
  estimatedMarketValue: number;
  depreciationRate: number;
  usabilityStatus: string;
  aiConfidence: number;
  analysisReport: {
    summary: string;
    conditionDetails: string;
    billDataExtraction: string;
    valueEstimationReasoning: string;
    recommendations: string[];
  };
}

export default function ExchangesPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [equipmentImage, setEquipmentImage] = useState<File | null>(null);
  const [billImage, setBillImage] = useState<File | null>(null);
  const [equipmentPreview, setEquipmentPreview] = useState<string | null>(null);
  const [billPreview, setBillPreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const { data: exchanges = [], isLoading } = useQuery<ExchangeWithDetails[]>({
    queryKey: ['/api/exchanges/my-exchanges'],
  });

  const createExchangeMutation = useMutation({
    mutationFn: async () => {
      if (!equipmentImage || !billImage) {
        throw new Error("Both images are required");
      }

      const formData = new FormData();
      formData.append('equipmentImage', equipmentImage);
      formData.append('billImage', billImage);

      setAnalysisProgress(10);
      const response = await fetch('/api/exchanges/ai-analyze', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      setAnalysisProgress(90);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to analyze equipment');
      }

      setAnalysisProgress(100);
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data.aiAnalysis);
      queryClient.invalidateQueries({ queryKey: ['/api/exchanges/my-exchanges'] });
      toast({
        title: "Analysis Complete!",
        description: `Your ${data.aiAnalysis.productName} has been listed with an estimated value of $${data.aiAnalysis.estimatedMarketValue.toFixed(2)}`,
      });
      
      // Reset after a delay to show results
      setTimeout(() => {
        setShowCreateDialog(false);
        setEquipmentImage(null);
        setBillImage(null);
        setEquipmentPreview(null);
        setBillPreview(null);
        setAnalysisResult(null);
        setAnalysisProgress(0);
      }, 5000);
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
      setAnalysisProgress(0);
    },
  });

  const handleEquipmentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEquipmentImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setEquipmentPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBillImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBillImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setBillPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!equipmentImage || !billImage) {
      toast({
        title: "Missing Images",
        description: "Please upload both equipment photo and bill photo",
        variant: "destructive",
      });
      return;
    }
    createExchangeMutation.mutate();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'fair': return 'text-yellow-600 dark:text-yellow-400';
      case 'poor': return 'text-orange-600 dark:text-orange-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getUsabilityBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'usable': return <Badge className="bg-green-500">✓ Usable</Badge>;
      case 'service_recommended': return <Badge className="bg-yellow-500">⚠ Service Recommended</Badge>;
      case 'replace_immediately': return <Badge className="bg-red-500">✗ Replace Immediately</Badge>;
      default: return null;
    }
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(typeof value === 'string' ? parseFloat(value) : value);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")} data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-primary to-purple-600 rounded-lg p-2">
                  <ArrowLeftRight className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold">AI Exchange Marketplace</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2" data-testid="button-create-listing">
                    <Sparkles className="h-4 w-4" />
                    AI-Powered Listing
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI-Powered Equipment Analysis
                    </DialogTitle>
                    <DialogDescription>
                      Upload photos of your equipment and bill to get instant AI valuation
                    </DialogDescription>
                  </DialogHeader>

                  {!analysisResult ? (
                    <div className="space-y-6">
                      {/* Image Upload Section */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Equipment Photo */}
                        <div className="space-y-3">
                          <label className="text-sm font-semibold flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Equipment Photo
                          </label>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center hover-elevate cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleEquipmentImageChange}
                              className="hidden"
                              id="equipment-upload"
                              data-testid="input-equipment-image"
                            />
                            <label htmlFor="equipment-upload" className="cursor-pointer">
                              {equipmentPreview ? (
                                <img
                                  src={equipmentPreview}
                                  alt="Equipment"
                                  className="max-h-48 mx-auto rounded-md mb-2"
                                />
                              ) : (
                                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                              )}
                              <p className="text-sm text-muted-foreground">
                                {equipmentPreview ? 'Click to change' : 'Click to upload equipment photo'}
                              </p>
                            </label>
                          </div>
                        </div>

                        {/* Bill Photo */}
                        <div className="space-y-3">
                          <label className="text-sm font-semibold flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Bill/Invoice Photo
                          </label>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center hover-elevate cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleBillImageChange}
                              className="hidden"
                              id="bill-upload"
                              data-testid="input-bill-image"
                            />
                            <label htmlFor="bill-upload" className="cursor-pointer">
                              {billPreview ? (
                                <img
                                  src={billPreview}
                                  alt="Bill"
                                  className="max-h-48 mx-auto rounded-md mb-2"
                                />
                              ) : (
                                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                              )}
                              <p className="text-sm text-muted-foreground">
                                {billPreview ? 'Click to change' : 'Click to upload bill/invoice'}
                              </p>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {createExchangeMutation.isPending && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Analyzing...</span>
                            <span className="text-muted-foreground">{analysisProgress}%</span>
                          </div>
                          <Progress value={analysisProgress} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            AI is analyzing your equipment photo and extracting data from your bill...
                          </p>
                        </div>
                      )}

                      {/* Submit Button */}
                      <Button
                        onClick={handleSubmit}
                        disabled={!equipmentImage || !billImage || createExchangeMutation.isPending}
                        className="w-full gap-2"
                        data-testid="button-analyze"
                      >
                        <Sparkles className="h-4 w-4" />
                        {createExchangeMutation.isPending ? 'Analyzing...' : 'Analyze & List Equipment'}
                      </Button>
                    </div>
                  ) : (
                    /* Analysis Results */
                    <div className="space-y-6">
                      {/* Success Message */}
                      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                          <CheckCircle className="h-5 w-5" />
                          <h3 className="font-semibold">Analysis Complete!</h3>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          {analysisResult.analysisReport.summary}
                        </p>
                      </div>

                      {/* Product Details */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Product Identification</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Product:</span>
                              <div className="font-semibold" data-testid="text-product-name">{analysisResult.productName}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Type:</span>
                              <div className="font-semibold">{analysisResult.productType}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Manufacturer:</span>
                              <div className="font-semibold">{analysisResult.manufacturer}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Part Number:</span>
                              <div className="font-semibold font-mono">{analysisResult.partNumber}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Material:</span>
                              <div className="font-semibold">{analysisResult.materialType}</div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Condition Assessment</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Visual Condition:</span>
                              <div className={`font-semibold text-lg ${getConditionColor(analysisResult.visualCondition)}`}>
                                {analysisResult.visualCondition.toUpperCase()}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Condition Score (VCI):</span>
                              <div className="flex items-center gap-2">
                                <Progress value={analysisResult.conditionScore} className="h-2 flex-1" />
                                <span className="font-semibold">{analysisResult.conditionScore}/100</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Status:</span>
                              <div>{getUsabilityBadge(analysisResult.usabilityStatus)}</div>
                            </div>
                            {analysisResult.detectedIssues.length > 0 && (
                              <div>
                                <span className="text-muted-foreground">Issues Detected:</span>
                                <ul className="list-disc list-inside text-xs space-y-1 mt-1">
                                  {analysisResult.detectedIssues.map((issue, i) => (
                                    <li key={i} className="text-muted-foreground">{issue}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Financial Analysis */}
                      <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-primary" />
                            Valuation & Pricing
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">Original Price</div>
                              <div className="text-2xl font-bold">{formatCurrency(analysisResult.originalPrice)}</div>
                              <div className="text-xs text-muted-foreground">Purchased: {new Date(analysisResult.purchaseDate).toLocaleDateString()}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <TrendingDown className="h-4 w-4" />
                                Depreciation
                              </div>
                              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {analysisResult.depreciationRate.toFixed(1)}%
                              </div>
                              <div className="text-xs text-muted-foreground">Since purchase</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">Current Market Value</div>
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-market-value">
                                {formatCurrency(analysisResult.estimatedMarketValue)}
                              </div>
                              <div className="text-xs text-muted-foreground">AI estimated</div>
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <div className="text-sm font-semibold mb-1">Value Estimation Reasoning:</div>
                            <p className="text-sm text-muted-foreground">{analysisResult.analysisReport.valueEstimationReasoning}</p>
                          </div>

                          <div>
                            <div className="text-sm font-semibold mb-1">Remaining Useful Life:</div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-base">{analysisResult.remainingUsefulLife}</Badge>
                              <span className="text-xs text-muted-foreground">
                                AI Confidence: {(analysisResult.aiConfidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Recommendations */}
                      {analysisResult.analysisReport.recommendations.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <AlertCircle className="h-5 w-5 text-blue-500" />
                              AI Recommendations
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {analysisResult.analysisReport.recommendations.map((rec, i) => (
                                <li key={i} className="flex gap-2 text-sm">
                                  <span className="text-blue-500 mt-0.5">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowCreateDialog(false);
                            setAnalysisResult(null);
                            setEquipmentImage(null);
                            setBillImage(null);
                            setEquipmentPreview(null);
                            setBillPreview(null);
                            setAnalysisProgress(0);
                          }}
                          className="flex-1"
                        >
                          Create Another
                        </Button>
                        <Button onClick={() => setShowCreateDialog(false)} className="flex-1">
                          Done
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Your Exchange Listings</h2>
          <p className="text-muted-foreground">
            AI-powered equipment valuation • {exchanges.length} active listings
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : exchanges.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Listings Yet</h3>
              <p className="text-muted-foreground mb-4">
                Use AI to analyze your equipment and create intelligent listings
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Create First Listing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {exchanges.map((exchange) => (
              <Card key={exchange.id} className="hover-elevate" data-testid={`card-exchange-${exchange.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {exchange.productName || exchange.offeredItem?.name || 'Exchange Offer'}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {exchange.productType || exchange.offeredItem?.category}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(exchange.status)}>
                      {exchange.status}
                    </Badge>
                  </div>
                </CardHeader>

                {exchange.equipmentImageUrl && (
                  <div className="px-6">
                    <img
                      src={exchange.equipmentImageUrl}
                      alt={exchange.productName || 'Equipment'}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                <CardContent className="space-y-3 mt-4">
                  {exchange.visualCondition && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Condition:</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${getConditionColor(exchange.visualCondition)}`}>
                          {exchange.visualCondition.toUpperCase()}
                        </span>
                        {exchange.conditionScore && (
                          <Badge variant="outline">{exchange.conditionScore}/100</Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {exchange.manufacturer && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Manufacturer:</span>
                      <span className="font-medium">{exchange.manufacturer}</span>
                    </div>
                  )}

                  {exchange.partNumber && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Part Number:</span>
                      <span className="font-mono text-xs">{exchange.partNumber}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    {exchange.originalPrice && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Original Price:</span>
                        <span className="font-medium">{formatCurrency(exchange.originalPrice)}</span>
                      </div>
                    )}
                    {exchange.estimatedMarketValue && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Market Value:</span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(exchange.estimatedMarketValue)}
                        </span>
                      </div>
                    )}
                    {exchange.depreciationRate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Depreciation:</span>
                        <span className="font-medium text-orange-600 dark:text-orange-400">
                          {parseFloat(exchange.depreciationRate).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {exchange.usabilityStatus && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        {getUsabilityBadge(exchange.usabilityStatus)}
                      </div>
                    </>
                  )}

                  {exchange.remainingUsefulLife && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Remaining Life:</span>
                      <Badge variant="outline">{exchange.remainingUsefulLife}</Badge>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="gap-2 flex-wrap">
                  <Button variant="outline" className="flex-1" data-testid={`button-view-${exchange.id}`}>
                    View Details
                  </Button>
                  {exchange.status === 'pending' && (
                    <Button className="flex-1">
                      Edit Listing
                    </Button>
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
