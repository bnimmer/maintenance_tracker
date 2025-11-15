import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Alerts() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { data: alerts, isLoading } = trpc.alerts.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const markAsRead = trpc.alerts.markRead.useMutation({
    onSuccess: () => {
      utils.alerts.list.invalidate();
      utils.dashboard.stats.invalidate();
      toast.success("Alert marked as read");
    },
    onError: (error) => {
      toast.error("Failed to mark alert: " + error.message);
    },
  });

  const handleMarkAsRead = (id: number) => {
    markAsRead.mutate({ id });
  };

  const unreadAlerts = alerts?.filter((a) => a.isRead === 0) || [];
  const readAlerts = alerts?.filter((a) => a.isRead === 1) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground">Maintenance notifications and reminders</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading alerts...</div>
          </div>
        ) : (
          <>
            {unreadAlerts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Unread Alerts</h2>
                {unreadAlerts.map((alert) => (
                  <Card key={alert.id} className="border-l-4 border-l-destructive">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                      <div className="flex items-start gap-4">
                        <AlertCircle className="h-5 w-5 text-destructive mt-1" />
                        <div>
                          <CardTitle className="text-base">{alert.message}</CardTitle>
                          <CardDescription className="mt-1">
                            {format(new Date(alert.createdAt), "PPp")}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(alert.id)}
                        disabled={markAsRead.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Read
                      </Button>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}

            {readAlerts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Read Alerts</h2>
                {readAlerts.map((alert) => (
                  <Card key={alert.id} className="opacity-60">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <CheckCircle className="h-5 w-5 text-muted-foreground mt-1" />
                        <div>
                          <CardTitle className="text-base">{alert.message}</CardTitle>
                          <CardDescription className="mt-1">
                            {format(new Date(alert.createdAt), "PPp")}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}

            {alerts && alerts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 border rounded-lg border-dashed">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No alerts</h3>
                <p className="text-muted-foreground">All your machines are up to date</p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
