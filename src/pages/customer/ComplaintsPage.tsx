import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Plus, Phone, Eye } from "lucide-react";
import type { CustomerSession } from "./CustomerLayout";

const faultTypes = ["Flat Tyre", "Empty Tank", "Battery Issue", "Key Lock", "Accident", "Other"];

interface Complaint {
  complaint_number: string;
  vehicle_number: string | null;
  service_city: string | null;
  fault_type: string;
  status: string;
  service_status: string;
  description: string | null;
  created_at: string;
  closed_at: string | null;
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

  useEffect(() => { fetchComplaints(); }, [session.mobile_number]);

  const handleSubmit = async () => {
    if (!form.fault_type) {
      toast({ title: "Required", description: "Please select a fault type.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const complaintNumber = `CMP${Date.now().toString().slice(-8)}`;
      const { error } = await supabase.from("complaints").insert({
        complaint_number: complaintNumber,
        customer_code: session.customer_code,
        customer_mobile: session.mobile_number,
        vehicle_number: form.vehicle_number || null,
        fault_type: form.fault_type,
        service_city: form.service_city || null,
        description: form.description || null,
      });
      if (error) throw error;
      toast({ title: "Complaint Raised", description: `Ticket ${complaintNumber} created successfully.` });
      setDialogOpen(false);
      setForm({ vehicle_number: session.vehicle_number || "", fault_type: "", service_city: session.city || "", description: "" });
      fetchComplaints();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">My Complaints</h1>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1"><Plus size={14} /> Raise Complaint</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Raise New Complaint</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Vehicle Number</Label>
                  <Input value={form.vehicle_number} onChange={e => setForm(p => ({ ...p, vehicle_number: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Fault Type *</Label>
                  <Select value={form.fault_type} onValueChange={v => setForm(p => ({ ...p, fault_type: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select fault type" /></SelectTrigger>
                    <SelectContent>
                      {faultTypes.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Service City</Label>
                  <Input value={form.service_city} onChange={e => setForm(p => ({ ...p, service_city: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
                </div>
                <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                  {submitting ? "Submitting..." : "Submit Complaint"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Phone size={12} /> For immediate help, call our 24/7 helpline: <strong>01147090909</strong>
      </p>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-4 text-muted-foreground">Loading...</p>
          ) : complaints.length === 0 ? (
            <p className="p-4 text-muted-foreground">No complaints found. You can raise a new complaint above.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Complaint No</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Fault Type</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Service Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map(c => (
                    <TableRow key={c.complaint_number}>
                      <TableCell className="font-mono text-xs">{c.complaint_number}</TableCell>
                      <TableCell>{c.vehicle_number || "—"}</TableCell>
                      <TableCell>{c.fault_type}</TableCell>
                      <TableCell>{c.service_city || "—"}</TableCell>
                      <TableCell>
                        <Badge className={c.status === "Open" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{c.service_status}</TableCell>
                      <TableCell className="text-xs">{new Date(c.created_at).toLocaleDateString("en-IN")}</TableCell>
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
};

export default ComplaintsPage;
