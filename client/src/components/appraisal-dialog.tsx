import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, IndianRupee, Sparkles, AlertCircle } from "lucide-react";
import { Appraisal } from "@shared/schema";
import { format } from "date-fns";
import { formatCurrency as formatCurrencyINR } from "@/lib/currency";

interface AppraisalDialogProps {
  itemId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppraisalDialog({ itemId, open, onOpenChange }: AppraisalDialogProps) {
  const { data: appraisal, isLoading } = useQuery<Appraisal>({
    queryKey: [`/api/appraisals/item/${itemId}`],
    enabled: open,
  });

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'ml_vision':
        return <Badge className="bg-purple-500"><Sparkles className="h-3 w-3 mr-1" /> AI Vision</Badge>;
      case 'manual':
        return <Badge variant="secondary">Manual</Badge>;
      case 'hybrid':
        return <Badge className="bg-blue-500"><Sparkles className="h-3 w-3 mr-1" /> Hybrid AI</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Appraisal Report</DialogTitle>
          <DialogDescription>
            Machine learning-based valuation and market analysis
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ) : appraisal ? (
          <div className="space-y-6">
            {/* Estimated Value */}
            <Card className="border-2 border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5" />
                    Estimated Market Value
                  </CardTitle>
                  {getMethodBadge(appraisal.appraisalMethod)}
                </div>
                <CardDescription>
                  <span className="text-4xl font-bold text-primary">
                    {formatCurrencyINR(appraisal.estimatedValue)}
                  </span>
                </CardDescription>
              </CardHeader>
              {appraisal.mlConfidence && (
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    AI Confidence: <span className="font-semibold">{(parseFloat(appraisal.mlConfidence) * 100).toFixed(0)}%</span>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Valuation Factors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {appraisal.conditionFactor && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Condition Factor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(parseFloat(appraisal.conditionFactor) * 100).toFixed(0)}%
                    </div>
                  </CardContent>
                </Card>
              )}

              {appraisal.ageFactor && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Age Factor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(parseFloat(appraisal.ageFactor) * 100).toFixed(0)}%
                    </div>
                  </CardContent>
                </Card>
              )}

              {appraisal.marketDemand && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Market Demand</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold capitalize ${getDemandColor(appraisal.marketDemand)}`}>
                      {appraisal.marketDemand}
                      {appraisal.marketDemand === 'high' && <TrendingUp className="inline h-6 w-6 ml-1" />}
                      {appraisal.marketDemand === 'low' && <TrendingDown className="inline h-6 w-6 ml-1" />}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Image Analysis */}
            {appraisal.imageAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Vision Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="font-semibold text-sm mb-1">Quality Score</div>
                    <div className="text-2xl font-bold text-primary">
                      {appraisal.imageAnalysis.quality_score}/100
                    </div>
                  </div>
                  
                  {appraisal.imageAnalysis.defects && appraisal.imageAnalysis.defects.length > 0 && (
                    <div>
                      <div className="font-semibold text-sm mb-2">Detected Issues:</div>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {appraisal.imageAnalysis.defects.map((defect, index) => (
                          <li key={index} className="text-muted-foreground">{defect}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {appraisal.notes && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-1">Appraiser Notes</div>
                  <div className="text-sm">{appraisal.notes}</div>
                </AlertDescription>
              </Alert>
            )}

            {/* Footer */}
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              {appraisal.appraisedBy && (
                <div>
                  <span className="font-semibold">Appraised by:</span> {appraisal.appraisedBy}
                </div>
              )}
              {appraisal.createdAt && (
                <div>
                  <span className="font-semibold">Appraisal date:</span> {format(new Date(appraisal.createdAt), 'PPP')}
                </div>
              )}
            </div>
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              No appraisal available for this item yet.
            </AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
