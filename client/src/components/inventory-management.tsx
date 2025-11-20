import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Item } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit, Trash2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";

interface InventoryManagementProps {
  items: Item[];
}

export default function InventoryManagement({ items }: InventoryManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await apiRequest("DELETE", `/api/items/${itemId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/items/my-items'] });
      toast({
        title: "Item deleted",
        description: "The item has been removed from your inventory.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ itemId, status }: { itemId: string; status: string }) => {
      await apiRequest("PATCH", `/api/items/${itemId}/availability`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/items/my-items'] });
      toast({
        title: "Availability updated",
        description: "Item availability status has been changed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (item: Item) => {
    if (item.status === 'unavailable') {
      return <Badge variant="destructive">Unavailable</Badge>;
    } else if (item.availableQuantity === 0) {
      return <Badge variant="secondary">All Rented</Badge>;
    } else if (item.availableQuantity < item.quantity) {
      return <Badge className="bg-orange-500 text-white border-0">Partially Rented</Badge>;
    } else {
      return <Badge className="bg-green-500 text-white border-0">Available</Badge>;
    }
  };

  const handleToggleAvailability = (item: Item) => {
    const newStatus = item.status === 'available' ? 'unavailable' : 'available';
    toggleAvailabilityMutation.mutate({ itemId: item.id, status: newStatus });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Inventory Management</CardTitle>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search inventory..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-inventory"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted rounded-full p-6 mb-4">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground max-w-md">
              {searchTerm ? "Try adjusting your search terms" : "Add your first item to get started"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price/Day</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id} data-testid={`row-item-${item.id}`}>
                      <TableCell>
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        {formatCurrency(item.pricePerDay)}
                      </TableCell>
                      <TableCell>
                        {item.availableQuantity} / {item.quantity}
                      </TableCell>
                      <TableCell>{getStatusBadge(item)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={item.status === 'available'}
                          onCheckedChange={() => handleToggleAvailability(item)}
                          disabled={toggleAvailabilityMutation.isPending}
                          data-testid={`toggle-availability-${item.id}`}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-edit-${item.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(item.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-${item.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="flex gap-4 p-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold truncate">{item.name}</h3>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {item.category}
                          </Badge>
                        </div>
                        {getStatusBadge(item)}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.availableQuantity} / {item.quantity} available
                        </span>
                        <span className="font-semibold text-primary">
                          {formatCurrency(item.pricePerDay)}/day
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm pt-2">
                        <span className="text-muted-foreground">Available:</span>
                        <Switch
                          checked={item.status === 'available'}
                          onCheckedChange={() => handleToggleAvailability(item)}
                          disabled={toggleAvailabilityMutation.isPending}
                          data-testid={`toggle-availability-${item.id}`}
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-3 w-3 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(item.id)}
                          disabled={deleteMutation.isPending}
                          className="text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
