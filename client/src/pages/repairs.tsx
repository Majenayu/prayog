import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Wrench, AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { RepairRequestWithDetails } from "@shared/schema";
import { ThemeToggle } from "@/components/theme-toggle";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth-context";

export default function RepairsPage() {
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high" | "critical">("medium");
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: repairs = [], isLoading } = useQuery<RepairRequestWithDetails[]>({
    queryKey: ['/api/repairs/my-requests'],
  });

  const { data: items = [] } = useQuery({
    queryKey: user?.role === "industry" ? ['/api/items/my-items'] : ['/api/items'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { itemId: string; issueDescription: string; urgency: string }) => {
      return await apiRequest("POST", "/api/repairs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/repairs/my-requests'] });
      setDialogOpen(false);
      setIssueDescription("");
      setSelectedItemId("");
      setUrgency("medium");
      toast({
        title: "Repair request submitted",
        description: "Your repair request has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create repair request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedItemId || !issueDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please select an item and describe the issue.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      itemId: selectedItemId,
      issueDescription,
      urgency,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <Wrench className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
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
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold">Repair & Maintenance</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user?.role !== "industry" && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Request Repair</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Request Equipment Repair</DialogTitle>
                      <DialogDescription>
                        Submit a repair request for equipment that needs maintenance or fixing.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="item">Equipment</Label>
                        <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                          <SelectTrigger id="item">
                            <SelectValue placeholder="Select equipment" />
                          </SelectTrigger>
                          <SelectContent>
                            {items.map((item: any) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="urgency">Urgency Level</Label>
                        <Select value={urgency} onValueChange={(value: any) => setUrgency(value)}>
                          <SelectTrigger id="urgency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Issue Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe the problem or maintenance needed..."
                          value={issueDescription}
                          onChange={(e) => setIssueDescription(e.target.value)}
                          rows={5}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                        {createMutation.isPending ? "Submitting..." : "Submit Request"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {user?.role === "industry" ? "Repair Requests from Customers" : "Your Repair Requests"}
          </h2>
          <p className="text-muted-foreground">
            {user?.role === "industry" 
              ? `Manage repair requests for your equipment • ${repairs.length} total requests`
              : `Track the status of your equipment repairs • ${repairs.length} active requests`}
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
        ) : repairs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Wrench className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Repair Requests</h3>
              <p className="text-muted-foreground mb-4">
                {user?.role === "industry" 
                  ? "No customers have submitted repair requests yet."
                  : "You haven't submitted any repair requests yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {repairs.map((repair) => (
              <Card key={repair.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        {repair.itemName}
                      </CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-2">
                        <Badge className={getStatusColor(repair.status)} variant="default">
                          {getStatusIcon(repair.status)}
                          <span className="ml-1">{repair.status.toUpperCase()}</span>
                        </Badge>
                        <Badge className={getUrgencyColor(repair.urgency)} variant="secondary">
                          {repair.urgency.toUpperCase()}
                        </Badge>
                      </CardDescription>
                    </div>
                    {repair.imageUrl && (
                      <img
                        src={repair.imageUrl}
                        alt={repair.itemName}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold mb-2">Issue Description:</div>
                    <p className="text-sm text-muted-foreground">{repair.issueDescription}</p>
                  </div>

                  {user?.role === "industry" && (
                    <div className="text-sm">
                      <span className="font-semibold">Requested by:</span> {repair.userName}
                    </div>
                  )}

                  {repair.estimatedCost && (
                    <div className="text-sm">
                      <span className="font-semibold">Estimated Cost:</span> ${repair.estimatedCost}
                    </div>
                  )}

                  {repair.actualCost && (
                    <div className="text-sm">
                      <span className="font-semibold">Actual Cost:</span> ${repair.actualCost}
                    </div>
                  )}

                  {repair.notes && (
                    <div>
                      <div className="text-sm font-semibold mb-1">Notes:</div>
                      <p className="text-sm text-muted-foreground">{repair.notes}</p>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Requested on {new Date(repair.createdAt!).toLocaleDateString()}
                  </div>
                </CardContent>

                {user?.role === "industry" && repair.status === "pending" && (
                  <CardFooter className="gap-2">
                    <Button variant="outline" className="flex-1">
                      Mark In Progress
                    </Button>
                    <Button className="flex-1">
                      Complete
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
