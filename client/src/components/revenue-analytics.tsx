import { useMemo } from "react";
import { RentalWithDetails, Item } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, IndianRupee, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatCurrencyShort } from "@/lib/currency";

interface RevenueAnalyticsProps {
  rentals: RentalWithDetails[];
  items: Item[];
}

export default function RevenueAnalytics({ rentals, items }: RevenueAnalyticsProps) {
  const totalRevenue = rentals.reduce((sum, r) => sum + parseFloat(r.totalAmount), 0);
  
  const thisMonthRevenue = useMemo(() => {
    return rentals
      .filter(r => {
        const rentalDate = new Date(r.createdAt!);
        const now = new Date();
        return rentalDate.getMonth() === now.getMonth() && 
               rentalDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, r) => sum + parseFloat(r.totalAmount), 0);
  }, [rentals]);

  const lastMonthRevenue = useMemo(() => {
    return rentals
      .filter(r => {
        const rentalDate = new Date(r.createdAt!);
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return rentalDate.getMonth() === lastMonth.getMonth() && 
               rentalDate.getFullYear() === lastMonth.getFullYear();
      })
      .reduce((sum, r) => sum + parseFloat(r.totalAmount), 0);
  }, [rentals]);

  const growth = lastMonthRevenue > 0 
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
    : "0";

  const revenueByMonth = useMemo(() => {
    const monthData: { [key: string]: number } = {};
    
    rentals.forEach(rental => {
      const date = new Date(rental.createdAt!);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthData[monthKey] = (monthData[monthKey] || 0) + parseFloat(rental.totalAmount);
    });

    return Object.entries(monthData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([month, revenue]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        revenue: parseFloat(revenue.toFixed(2)),
      }));
  }, [rentals]);

  const revenueByItem = useMemo(() => {
    const itemRevenue: { [key: string]: { name: string; revenue: number } } = {};
    
    rentals.forEach(rental => {
      if (rental.itemId) {
        if (!itemRevenue[rental.itemId]) {
          itemRevenue[rental.itemId] = {
            name: rental.itemName || 'Unknown',
            revenue: 0,
          };
        }
        itemRevenue[rental.itemId].revenue += parseFloat(rental.totalAmount);
      }
    });

    return Object.values(itemRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [rentals]);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-3" data-testid="text-analytics-total">
              {formatCurrencyShort(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All-time earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-4" data-testid="text-analytics-month">
              {formatCurrencyShort(thisMonthRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current month revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${parseFloat(growth) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {parseFloat(growth) >= 0 ? '+' : ''}{growth}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs. last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueByMonth.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No revenue data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    name="Revenue (₹)"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Item</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueByItem.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No revenue data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueByItem}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${formatCurrencyShort(entry.revenue)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {revenueByItem.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          {rentals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rentals.slice(0, 10).map((rental) => (
                    <TableRow key={rental.id}>
                      <TableCell className="font-medium">{rental.itemName}</TableCell>
                      <TableCell>{rental.userName}</TableCell>
                      <TableCell>{rental.days}</TableCell>
                      <TableCell className="font-semibold text-primary">
                        {formatCurrency(rental.totalAmount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(rental.createdAt!).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={rental.status === 'active' ? 'default' : 'secondary'}
                        >
                          {rental.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
