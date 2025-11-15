import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Calendar, Eye, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Machines() {
  const { isAuthenticated } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    machineId: "",
    name: "",
    location: "",
    description: "",
    intervalDays: "",
  });

  const utils = trpc.useUtils();
  const { data: machines, isLoading } = trpc.machines.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createMachine = trpc.machines.create.useMutation({
    onSuccess: () => {
      utils.machines.list.invalidate();
      utils.dashboard.stats.invalidate();
      setIsDialogOpen(false);
      setFormData({
        machineId: "",
        name: "",
        location: "",
        description: "",
        intervalDays: "",
      });
      toast.success("Machine added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add machine: " + error.message);
    },
  });

  const deleteMachine = trpc.machines.delete.useMutation({
    onSuccess: () => {
      utils.machines.list.invalidate();
      utils.dashboard.stats.invalidate();
      toast.success("Machine deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete machine: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMachine.mutate({
      machineId: formData.machineId,
      name: formData.name,
      location: formData.location || undefined,
      description: formData.description || undefined,
      intervalDays: formData.intervalDays ? parseInt(formData.intervalDays) : undefined,
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This will also delete all associated maintenance history.`)) {
      deleteMachine.mutate({ id });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Machines</h1>
            <p className="text-muted-foreground">Manage your equipment and machinery</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Machine
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading machines...</div>
          </div>
        ) : machines && machines.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Machine ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {machines.map((machine) => (
                  <TableRow key={machine.id}>
                    <TableCell className="font-medium">{machine.machineId}</TableCell>
                    <TableCell>{machine.name}</TableCell>
                    <TableCell>{machine.location || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate">{machine.description || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/machines/${machine.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(machine.id, machine.name)}
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
        ) : (
          <div className="flex flex-col items-center justify-center h-64 border rounded-lg border-dashed">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No machines yet</h3>
            <p className="text-muted-foreground mb-4">Add your first machine to start tracking maintenance</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Machine
            </Button>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Machine</DialogTitle>
              <DialogDescription>
                Enter the details of the machine you want to track
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="machineId">Machine ID *</Label>
                  <Input
                    id="machineId"
                    placeholder="e.g., CNC-001"
                    value={formData.machineId}
                    onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., CNC Milling Machine"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Workshop A"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Additional details about the machine"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="intervalDays">Maintenance Interval (days)</Label>
                  <Input
                    id="intervalDays"
                    type="number"
                    placeholder="e.g., 30"
                    value={formData.intervalDays}
                    onChange={(e) => setFormData({ ...formData, intervalDays: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    How often this machine needs maintenance
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMachine.isPending}>
                  {createMachine.isPending ? "Adding..." : "Add Machine"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
