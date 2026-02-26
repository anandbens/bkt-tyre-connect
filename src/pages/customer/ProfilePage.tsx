import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { indianStates, indiaStatesAndCities } from "@/data/indiaStatesAndCities";
import type { CustomerSession } from "./CustomerLayout";

const ProfilePage: React.FC = () => {
  const session = useOutletContext<CustomerSession>();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customer_name: session.customer_name || "",
    email: session.email || "",
    mobile_number: session.mobile_number || "",
    state: session.state || "",
    city: session.city || "",
    vehicle_number: session.vehicle_number || "",
    vehicle_make_model: session.vehicle_make_model || "",
  });

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("customers")
        .update({
          customer_name: form.customer_name,
          email: form.email || null,
          state: form.state || null,
          city: form.city,
          vehicle_number: form.vehicle_number,
          vehicle_make_model: form.vehicle_make_model || null,
        })
        .eq("customer_code", session.customer_code);

      if (error) throw error;

      // Update local session
      const updated = { ...session, ...form };
      localStorage.setItem("customer_session", JSON.stringify(updated));

      toast({ title: "Profile Updated", description: "Your profile has been saved." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Profile</h1>
      <Card className="max-w-3xl">
        <CardContent className="pt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={form.customer_name} onChange={(e) => updateField("customer_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Mobile Number</Label>
              <Input value={form.mobile_number} disabled className="bg-muted" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>State</Label>
              <Select value={form.state} onValueChange={(val) => { updateField("state", val); updateField("city", ""); }}>
                <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                <SelectContent className="bg-white max-h-60 z-50">
                  {indianStates.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Select value={form.city} onValueChange={(val) => updateField("city", val)} disabled={!form.state}>
                <SelectTrigger><SelectValue placeholder={form.state ? "Select City" : "Select state first"} /></SelectTrigger>
                <SelectContent className="bg-white max-h-60 z-50">
                  {(form.state ? indiaStatesAndCities[form.state] || [] : []).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Vehicle Number</Label>
              <Input value={form.vehicle_number} onChange={(e) => updateField("vehicle_number", e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Vehicle Make & Model</Label>
              <Input value={form.vehicle_make_model} onChange={(e) => updateField("vehicle_make_model", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Customer Code</Label>
              <Input value={session.customer_code} disabled className="bg-muted" />
            </div>
            <div className="space-y-1.5">
              <Label>Dealer Code</Label>
              <Input value={session.dealer_code} disabled className="bg-muted" />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {saving ? "Saving..." : "Update Profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
