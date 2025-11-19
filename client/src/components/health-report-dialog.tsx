import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, AlertCircle, Calendar, User } from "lucide-react";
import { HealthReport } from "@shared/schema";
import { format } from "date-fns";

interface HealthReportDialogProps {
  itemId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HealthReportDialog({ itemId, open, onOpenChange }: HealthReportDialogProps) {
  const { data: report, isLoading } = useQuery<HealthReport>({
    queryKey: [`/api/health-reports/item/${itemId}`],
    enabled: open,
  });

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Health Inspection Report</DialogTitle>
          <DialogDescription>
            Detailed condition assessment and maintenance history
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ) : report ? (
          <div className="space-y-6">
            {/* Overall Condition */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Overall Condition</CardTitle>
                  <Badge className={getConditionColor(report.overallCondition)}>
                    {report.overallCondition.toUpperCase()}
                  </Badge>
                </div>
                <CardDescription>
                  Condition Score: <span className={`text-2xl font-bold ${getScoreColor(report.conditionScore)}`}>
                    {report.conditionScore}/100
                  </span>
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Inspection Details */}
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Visual Inspection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{report.visualInspection}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Functional Test
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{report.functionalTest}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Wear and Tear
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{report.wearAndTear}</p>
                </CardContent>
              </Card>
            </div>

            {/* Defects */}
            {report.defects && report.defects.length > 0 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Detected Defects:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {report.defects.map((defect, index) => (
                      <li key={index}>{defect}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Maintenance History */}
            {report.maintenanceHistory && report.maintenanceHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Maintenance History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {report.maintenanceHistory.map((record, index) => (
                      <div key={index} className="flex gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="font-medium">{record.date}</div>
                          <div className="text-muted-foreground">{record.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Footer Info */}
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold mb-1">Estimated Life Remaining</div>
                <div className="text-muted-foreground">{report.estimatedLifeRemaining}</div>
              </div>
              <div>
                <div className="font-semibold mb-1 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Inspected By
                </div>
                <div className="text-muted-foreground">{report.inspectedBy}</div>
              </div>
              {report.inspectionDate && (
                <div className="md:col-span-2">
                  <div className="font-semibold mb-1">Inspection Date</div>
                  <div className="text-muted-foreground">
                    {format(new Date(report.inspectionDate), 'PPP')}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              No health report available for this item yet.
            </AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
