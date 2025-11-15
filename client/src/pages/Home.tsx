import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Calendar, Cog, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const { data: stats, refetch } = trpc.dashboard.stats.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const checkOverdue = trpc.alerts.checkOverdue.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      checkOverdue.mutate();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="space-y-4">
            <Cog className="mx-auto h-16 w-16 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">Machinery Maintenance Tracker</h1>
            <p className="text-lg text-muted-foreground">
              Keep your equipment running smoothly with scheduled maintenance tracking, alerts, and comprehensive history logs.
            </p>
          </div>
          <div className="space-y-4">
            <Button asChild size="lg" className="w-full">
              <a href={getLoginUrl()}>Sign In to Get Started</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your machinery maintenance status</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Machines</CardTitle>
              <Cog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalMachines ?? 0}</div>
              <p className="text-xs text-muted-foreground">Active equipment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Maintenance</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats?.overdueCount ?? 0}</div>
              <p className="text-xs text-muted-foreground">Requires immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming (7 days)</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.upcomingCount ?? 0}</div>
              <p className="text-xs text-muted-foreground">Scheduled maintenance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Alerts</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.unreadAlerts ?? 0}</div>
              <p className="text-xs text-muted-foreground">Notifications pending</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link href="/machines">View All Machines</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/alerts">View Alerts</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Set up your maintenance tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {stats?.totalMachines === 0
                  ? "Add your first machine to start tracking maintenance schedules and history."
                  : "Your machinery is being tracked. Check alerts for any overdue maintenance."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
