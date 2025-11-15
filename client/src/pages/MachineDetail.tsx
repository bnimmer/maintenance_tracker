import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, Calendar, FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { format } from "date-fns";

export default function MachineDetail() {
  const { id } = useParams();
  const machineId = parseInt(id || "0");
  const { isAuthenticated } = useAuth();
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [historyForm, setHistoryForm] = useState({
    maintenanceDate: new Date().toISOString().split("T")[0],
    maintenanceType: "",
    notes: "",
    technicianName: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    fileKey: string;
    fileUrl: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    intervalDays: "",
  });

  const utils = trpc.useUtils();
  const { data: machine } = trpc.machines.get.useQuery({ id: machineId }, { enabled: isAuthenticated });
  const { data: schedule } = trpc.schedule.get.useQuery({ machineId }, { enabled: isAuthenticated });
  const { data: history } = trpc.history.list.useQuery({ machineId }, { enabled: isAuthenticated });

  const createHistory = trpc.history.create.useMutation({
    onSuccess: () => {
      utils.history.list.invalidate();
      utils.schedule.get.invalidate();
      utils.dashboard.stats.invalidate();
      setIsHistoryDialogOpen(false);
      setHistoryForm({
        maintenanceDate: new Date().toISOString().split("T")[0],
        maintenanceType: "",
        notes: "",
        technicianName: "",
      });
      setUploadedFiles([]);
      toast.success("Maintenance record added");
    },
    onError: (error) => {
      toast.error("Failed to add record: " + error.message);
    },
  });

  const deleteHistory = trpc.history.delete.useMutation({
    onSuccess: () => {
      utils.history.list.invalidate();
      toast.success("Maintenance record deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete record: " + error.message);
    },
  });

  const updateSchedule = trpc.schedule.update.useMutation({
    onSuccess: () => {
      utils.schedule.get.invalidate();
      setIsScheduleDialogOpen(false);
      toast.success("Maintenance schedule updated");
    },
    onError: (error) => {
      toast.error("Failed to update schedule: " + error.message);
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newFiles = [];

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/files/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        newFiles.push(data.file);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploadedFiles([...uploadedFiles, ...newFiles]);
    setIsUploading(false);
    if (newFiles.length > 0) {
      toast.success(`${newFiles.length} file(s) uploaded`);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleHistorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createHistory.mutate({
      machineId,
      maintenanceDate: new Date(historyForm.maintenanceDate),
      maintenanceType: historyForm.maintenanceType,
      notes: historyForm.notes || undefined,
      technicianName: historyForm.technicianName || undefined,
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
    });
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const intervalDays = parseInt(scheduleForm.intervalDays);
    const now = new Date();
    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + intervalDays);

    updateSchedule.mutate({
      machineId,
      intervalDays,
      lastMaintenanceDate: now,
      nextMaintenanceDate: nextDate,
    });
  };

  const handleDeleteHistory = (id: number) => {
    if (confirm("Are you sure you want to delete this maintenance record?")) {
      deleteHistory.mutate({ id });
    }
  };

  if (!machine) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/machines">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Machines
            </Link>
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">{machine.name}</h1>
          <p className="text-muted-foreground">Machine ID: {machine.machineId}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Machine Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm font-medium">Location:</span>
                <span className="text-sm text-muted-foreground ml-2">{machine.location || "Not specified"}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Description:</span>
                <p className="text-sm text-muted-foreground mt-1">{machine.description || "No description"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Maintenance Schedule</CardTitle>
                <CardDescription>Preventative maintenance timing</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setScheduleForm({ intervalDays: schedule?.intervalDays?.toString() || "" });
                  setIsScheduleDialogOpen(true);
                }}
              >
                {schedule ? "Edit" : "Set Schedule"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {schedule ? (
                <>
                  <div>
                    <span className="text-sm font-medium">Interval:</span>
                    <span className="text-sm text-muted-foreground ml-2">Every {schedule.intervalDays} days</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Last Maintenance:</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {schedule.lastMaintenanceDate ? format(new Date(schedule.lastMaintenanceDate), "PPP") : "Never"}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Next Maintenance:</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {schedule.nextMaintenanceDate ? format(new Date(schedule.nextMaintenanceDate), "PPP") : "Not scheduled"}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No maintenance schedule set</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Maintenance History</CardTitle>
              <CardDescription>Past maintenance records and activities</CardDescription>
            </div>
            <Button onClick={() => setIsHistoryDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          </CardHeader>
          <CardContent>
            {history && history.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{format(new Date(record.maintenanceDate), "PP")}</TableCell>
                        <TableCell>{record.maintenanceType}</TableCell>
                        <TableCell>{record.technicianName || "-"}</TableCell>
                        <TableCell className="max-w-xs truncate">{record.notes || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteHistory(record.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 border rounded-lg border-dashed">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No maintenance history yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Maintenance Record</DialogTitle>
              <DialogDescription>Record a maintenance activity for this machine</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleHistorySubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="maintenanceDate">Date *</Label>
                  <Input
                    id="maintenanceDate"
                    type="date"
                    value={historyForm.maintenanceDate}
                    onChange={(e) => setHistoryForm({ ...historyForm, maintenanceDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenanceType">Type *</Label>
                  <Input
                    id="maintenanceType"
                    placeholder="e.g., Oil Change, Inspection, Repair"
                    value={historyForm.maintenanceType}
                    onChange={(e) => setHistoryForm({ ...historyForm, maintenanceType: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="technicianName">Technician Name</Label>
                  <Input
                    id="technicianName"
                    placeholder="Who performed the maintenance"
                    value={historyForm.technicianName}
                    onChange={(e) => setHistoryForm({ ...historyForm, technicianName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional details about the maintenance"
                    value={historyForm.notes}
                    onChange={(e) => setHistoryForm({ ...historyForm, notes: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="files">Attach Files (Photos/Documents)</Label>
                  <Input
                    id="files"
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  {isUploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm border rounded p-2">
                          <span className="truncate">{file.fileName}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createHistory.isPending}>
                  {createHistory.isPending ? "Adding..." : "Add Record"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Maintenance Schedule</DialogTitle>
              <DialogDescription>Configure the preventative maintenance interval</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleScheduleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="intervalDays">Maintenance Interval (days) *</Label>
                  <Input
                    id="intervalDays"
                    type="number"
                    placeholder="e.g., 30"
                    value={scheduleForm.intervalDays}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, intervalDays: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    How often this machine needs maintenance
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateSchedule.isPending}>
                  {updateSchedule.isPending ? "Saving..." : "Save Schedule"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
