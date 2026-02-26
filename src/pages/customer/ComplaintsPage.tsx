import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Plus, Star } from "lucide-react";
import type { CustomerSession } from "./CustomerLayout";

const faultTypes = ["Flat Tyre", "Empty Tank", "Battery Issue", "Key Lock", "Accident", "Other"];

interface Complaint {
  id: string;
  complaint_number: string;
  vehicle_number: string | null;
  service_city: string | null;
  fault_type: string;
  status: string;
  service_status: string;
  closed_at: string | null;
  created_at: string;
  description: string | null;
}

const ComplaintsPage: React.FC = () => {
  const session = useOutletContext<CustomerSession>();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    vehicle_number: session.vehicle_number || "",
    fault_type: "",
    service_city: session.city || "",
    description: "",
  });

  const fetchComplaints = async () => {
    const { data } = await supabase
      .from("complaints")
      .select("*")
      .eq("customer_mobile", session.mobile_number)
      .order("created_at", { ascending: false });
    setComplaints((data as Complaint[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async () => {
    if (!form.fault_type) {
      toast({ title: "Error", description: "Please select a fault type.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("complaints").insert({
        customer_code: session.customer_code,
        customer_mobile: session.mobile_number,
        vehicle_number: form.vehicle_number || null,
        fault_type: form.fault_type,
        service_city: form.service_city || null,
        description: form.description || null,
        complaint_number: "", // trigger will auto-generate
      });
      if (error) throw error;
      toast({ title: "Complaint Raised", description: "Your complaint has been submitted successfully." });
      setDialogOpen(false);
      setForm({ vehicle_number: session.vehicle_number || "", fault_type: "", service_city: session.city || "", description: "" });
      fetchComplaints();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (s: string) => (s === "OPEN" ? "destructive" : s === "CLOSED" ? "default" : "secondary");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">My Complaints</h1>

      <Card>
        <CardContent className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone size={14} />
            For immediate help, call our 24/7 helpline: <strong>01147090909</strong>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setDialogOpen(true)}>
              <Plus size={14} /> Raise Complaint
            </Button>
            <Button variant="outline">
              <Star size={14} /> Write a Review
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Complaint Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : complaints.length === 0 ? (
            <p className="text-sm text-muted-foreground">No complaints found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Complaint No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Vehicle No</TableHead>
                    <TableHead>Service City</TableHead>
                    <TableHead>Fault Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Service Status</TableHead>
                    <TableHead>Closed Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.complaint_number}</TableCell>
                      <TableCell>{new Date(c.created_at).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell>{c.vehicle_number || "-"}</TableCell>
                      <TableCell>{c.service_city || "-"}</TableCell>
                      <TableCell>{c.fault_type}</TableCell>
                      <TableCell><Badge variant={statusColor(c.status)}>{c.status}</Badge></TableCell>
                      <TableCell><Badge variant="outline">{c.service_status}</Badge></TableCell>
                      <TableCell>{c.closed_at ? new Date(c.closed_at).toLocaleDateString("en-IN") : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Raise Complaint Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Raise a Complaint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Vehicle Number</Label>
              <Input value={form.vehicle_number} onChange={(e) => setForm((p) => ({ ...p, vehicle_number: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Fault Type *</Label>
              <Select value={form.fault_type} onValueChange={(v) => setForm((p) => ({ ...p, fault_type: v }))}>
                <SelectTrigger><SelectValue placeholder="Select fault type" /></SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {faultTypes.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Service City</Label>
              <Input value={form.service_city} onChange={(e) => setForm((p) => ({ ...p, service_city: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe the issue..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplaintsPage;
