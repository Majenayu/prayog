import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Sparkles, DollarSign, TrendingUp, TrendingDown, Loader2, Camera, AlertCircle, CheckCircle } from "lucide-react";
import { Appraisal, HealthReport } from "@shared/schema";
import { format } from "date-fns";

interface AIAppraisalDialogProps {
  itemId: string;
  itemName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AnalysisType = 'appraisal' | 'health';

export function AIAppraisalDialog({ itemId, itemName, open, onOpenChange }: AIAppraisalDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<AnalysisType>('appraisal');
  const [result, setResult] = useState<Appraisal | HealthReport | null>(null);
  const queryClient = useQueryClient();

  const appraisalMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/ai/appraisal', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'AI appraisal failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: [`/api/appraisals/item/${itemId}`] });
    },
  });

  const healthReportMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/ai/health-report', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'AI health report generation failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: [`/api/health-reports/item/${itemId}`] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('itemId', itemId);

    if (analysisType === 'appraisal') {
      appraisalMutation.mutate(formData);
    } else {
      healthReportMutation.mutate(formData);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    appraisalMutation.reset();
    healthReportMutation.reset();
  };

  const isLoading = appraisalMutation.isPending || healthReportMutation.isPending;
  const error = appraisalMutation.error || healthReportMutation.error;

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(value));
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const renderAppraisalResult = (appraisal: Appraisal) => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Alert className="border-green-500 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          AI appraisal completed successfully!
        </AlertDescription>
      </Alert>

      <Card className="border-2 border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Estimated Market Value
            </CardTitle>
            <Badge className="bg-purple-500">
              <Sparkles className="h-3 w-3 mr-1" /> AI Vision
            </Badge>
          </div>
          <CardDescription>
            <span className="text-4xl font-bold text-primary">
              {formatCurrency(appraisal.estimatedValue)}
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

      {appraisal.notes && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-1">AI Analysis Notes</div>
            <div className="text-sm">{appraisal.notes}</div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderHealthReportResult = (report: HealthReport) => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Alert className="border-green-500 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          AI health report generated successfully!
        </AlertDescription>
      </Alert>

      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Overall Condition
          </CardTitle>
          <CardDescription>
            <div className={`text-3xl font-bold capitalize ${getConditionColor(report.overallCondition)}`}>
              {report.overallCondition}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Condition Score: <span className="font-semibold text-primary">{report.conditionScore}/100</span>
            </div>
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Visual Inspection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{report.visualInspection}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Functional Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{report.functionalTest}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Wear and Tear Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{report.wearAndTear}</p>
          </CardContent>
        </Card>

        {report.defects && report.defects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Detected Defects</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {report.defects.map((defect, index) => (
                  <li key={index} className="text-muted-foreground">{defect}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {report.estimatedLifeRemaining && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-1">Estimated Life Remaining</div>
              <div className="text-sm">{report.estimatedLifeRemaining}</div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            AI-Powered Analysis
          </DialogTitle>
          <DialogDescription>
            Upload a live image of {itemName} for AI-powered appraisal and health assessment
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-6">
            <div className="flex gap-2">
              <Button
                variant={analysisType === 'appraisal' ? 'default' : 'outline'}
                onClick={() => setAnalysisType('appraisal')}
                className="flex-1"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Value Appraisal
              </Button>
              <Button
                variant={analysisType === 'health' ? 'default' : 'outline'}
                onClick={() => setAnalysisType('health')}
                className="flex-1"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Health Report
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="image-upload">Upload Equipment Image</Label>
                <div className="mt-2">
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {preview && (
                <Card>
                  <CardContent className="pt-6">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </CardContent>
                </Card>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Start AI Analysis
                    </>
                  )}
                </Button>
              </div>

              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-1">How it works:</div>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Upload a clear photo of the equipment</li>
                    <li>Our AI vision model analyzes the image</li>
                    <li>Get instant {analysisType === 'appraisal' ? 'market value estimation' : 'health condition report'}</li>
                    <li>Powered by advanced computer vision technology</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {'estimatedValue' in result ? renderAppraisalResult(result) : renderHealthReportResult(result)}
            
            <Separator />
            
            <div className="flex gap-3">
              <Button onClick={handleReset} variant="outline" className="flex-1">
                Analyze Another Image
              </Button>
              <Button onClick={() => onOpenChange(false)} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
