import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import StepIndicator from "@/components/StepIndicator";
import { CheckCircle, Truck, User, ShoppingBag, Phone, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { indianStates, indiaStatesAndCities } from "@/data/indiaStatesAndCities";

const steps = ["Register", "Personal Details", "Vehicle Details", "Tyre Purchase"];

const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const dealerCode = searchParams.get("dealer") || "DLR12345";

  const [step, setStep] = useState(0);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [customerCode, setCustomerCode] = useState("");
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [existingCustomer, setExistingCustomer] = useState<any>(null);
  const [form, setForm] = useState({
    mobile: "",
    name: "",
    email: "",
    state: "",
    city: "",
    vehicleNumber: "",
    vehicleMakeModel: "",
    tyreDetails: "",
    numberOfTyres: "1",
    invoiceNumber: "",
  });

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Step 1: Send OTP
  const sendOtp = () => {
    if (!/^\d{10}$/.test(form.mobile)) {
      toast({ title: "Invalid mobile", description: "Enter a valid 10-digit mobile number.", variant: "destructive" });
      return;
    }
    setOtpSent(true);
    toast({ title: "OTP Sent", description: `OTP sent to ${form.mobile}. Use 1234 for demo.` });
  };

  // Step 1: Verify OTP — check for existing registration
  const verifyOtp = async () => {
    if (otp !== "1234") {
      toast({ title: "Invalid OTP", description: "Please enter the correct OTP.", variant: "destructive" });
      return;
    }
    setRegistering(true);
    try {
      // Check if this mobile number is already registered (may have multiple rows)
      const { data: existingCustList } = await supabase
        .from("customers")
        .select("*")
        .eq("mobile_number", form.mobile)
        .order("created_at", { ascending: false });

      // Pick the most complete record (one with a real name, not just the mobile number)
      const existingCust = existingCustList && existingCustList.length > 0
        ? existingCustList.find(c => c.customer_name !== c.mobile_number && c.city !== "—") || existingCustList[0]
        : null;

      if (existingCust) {
        // Check if ANY of the customer's registrations have a completed subscription
        const allCodes = existingCustList!.map(c => c.customer_code);
        const { data: existingSubList } = await supabase
          .from("subscriptions")
          .select("*")
          .in("customer_code", allCodes)
          .eq("payment_status", "SUCCESS")
          .limit(1);

        const existingSub = existingSubList && existingSubList.length > 0 ? existingSubList[0] : null;

        if (existingSub) {
          // Fully completed — show message
          setAlreadyCompleted(true);
          setExistingCustomer(existingCust);
          return;
        }

        // Partial registration — pre-fill form and resume
        setCustomerCode(existingCust.customer_code);
        setExistingCustomer(existingCust);
        setForm((prev) => ({
          ...prev,
          name: existingCust.customer_name !== existingCust.mobile_number ? existingCust.customer_name : "",
          email: existingCust.email || "",
          state: existingCust.state || "",
          city: existingCust.city !== "—" ? existingCust.city : "",
          vehicleNumber: existingCust.vehicle_number !== "—" ? existingCust.vehicle_number : "",
          vehicleMakeModel: existingCust.vehicle_make_model || "",
          tyreDetails: existingCust.tyre_details || "",
          numberOfTyres: String(existingCust.number_of_tyres || 1),
          invoiceNumber: existingCust.invoice_number || "",
        }));
        toast({ title: "Welcome back!", description: "We found your registration. Please continue where you left off." });
        setStep(1);
        return;
      }

      // New customer — insert
      const { data, error } = await supabase
        .from("customers")
        .insert({
          mobile_number: form.mobile,
          customer_name: form.mobile,
          customer_code: "",
          dealer_code: dealerCode,
          city: "—",
          vehicle_number: "—",
        })
        .select()
        .single();

      if (error) throw error;
      setCustomerCode(data.customer_code);

      await supabase.from("referrals").insert({
        customer_code: data.customer_code,
        dealer_code: dealerCode,
        referral_source: "Dealer QR",
      });

      toast({ title: "OTP Verified!", description: "You are now registered. Please complete your profile." });
      setStep(1);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      toast({ title: "Registration Error", description: err.message, variant: "destructive" });
    } finally {
      setRegistering(false);
    }
  };

  // Step 2: Save personal details
  const savePersonalDetails = async () => {
    if (!form.name || !form.state || !form.city) {
      toast({ title: "Missing fields", description: "Name, State and City are mandatory.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase
        .from("customers")
        .update({
          customer_name: form.name,
          email: form.email || null,
          state: form.state || null,
          city: form.city,
        })
        .eq("customer_code", customerCode);
      if (error) throw error;
      setStep(2);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Step 3: Save vehicle details
  const saveVehicleDetails = async () => {
    if (!form.vehicleNumber) {
      toast({ title: "Missing field", description: "Vehicle number is mandatory.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase
        .from("customers")
        .update({
          vehicle_number: form.vehicleNumber,
          vehicle_make_model: form.vehicleMakeModel || null,
        })
        .eq("customer_code", customerCode);
      if (error) throw error;
      setStep(3);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Step 4: Save tyre purchase details & finish
  const saveTyreDetails = async () => {
    try {
      const { error } = await supabase
        .from("customers")
        .update({
          tyre_details: form.tyreDetails || null,
          number_of_tyres: parseInt(form.numberOfTyres) || 1,
          invoice_number: form.invoiceNumber || null,
        })
        .eq("customer_code", customerCode);
      if (error) throw error;
      toast({ title: "Registration Complete!", description: "You can now select a subscription plan." });
      navigate(`/plans?customer=${customerCode}&dealer=${dealerCode}&mobile=${form.mobile}&name=${encodeURIComponent(form.name)}`);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Already completed screen
  if (alreadyCompleted && existingCustomer) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="max-w-md shadow-elevated text-center">
            <CardContent className="py-10 space-y-4">
              <CheckCircle size={64} className="mx-auto text-success" />
              <h2 className="text-2xl font-bold">Already Registered!</h2>
              <p className="text-muted-foreground">
                You have already completed your registration and plan selection. Your subscription is active.
              </p>
              <div className="bg-secondary rounded-lg p-4 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-semibold">{existingCustomer.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mobile</span>
                  <span className="font-semibold">{existingCustomer.mobile_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer Code</span>
                  <span className="font-semibold">{existingCustomer.customer_code}</span>
                </div>
              </div>
              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
                onClick={() => window.open("https://www.crossroadshelpline.com/", "_blank")}
              >
                <ExternalLink size={16} />
                Login TAAS RSA App
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-background">
      <div className="bg-primary text-primary-foreground py-8 sm:py-10 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-1">TAAS Customer Registration</h1>
          <p className="text-xs sm:text-sm opacity-80">
            Register for BKT Crossroads Tyre Assistance & Service
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 -mt-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="shadow-elevated">
            <CardHeader className="pb-4">
              <StepIndicator steps={steps} currentStep={step} />
              <div className="flex items-center gap-2 bg-secondary rounded-md px-3 py-2 text-sm">
                <span className="text-muted-foreground">Dealer Code:</span>
                <span className="font-semibold">{dealerCode}</span>
                <span className="text-xs text-muted-foreground ml-auto hidden sm:inline">(Auto-filled)</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone size={18} className="text-accent" />
                      <CardTitle className="text-base">Mobile Number & OTP</CardTitle>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="mobile">Mobile Number *</Label>
                      <Input id="mobile" value={form.mobile} onChange={(e) => updateField("mobile", e.target.value)} placeholder="Enter 10-digit mobile number" maxLength={10} />
                    </div>
                    {!otpSent ? (
                      <Button onClick={sendOtp} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        Send OTP
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="otp">Enter OTP</Label>
                          <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 4-digit OTP" maxLength={4} className="text-center text-lg tracking-widest" />
                        </div>
                        <Button onClick={verifyOtp} disabled={registering} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                          {registering ? "Registering..." : "Register"}
                        </Button>
                        <button onClick={sendOtp} className="text-sm text-muted-foreground hover:text-foreground w-full text-center">
                          Resend OTP
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={18} className="text-accent" />
                      <CardTitle className="text-base">Personal Details</CardTitle>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input id="name" value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Full Name" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email (Optional)</Label>
                        <Input id="email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="email@example.com" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="state">State *</Label>
                        <Select value={form.state} onValueChange={(val) => { updateField("state", val); updateField("city", ""); }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent className="bg-white max-h-60 z-50">
                            {indianStates.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="city">City *</Label>
                        <Select value={form.city} onValueChange={(val) => updateField("city", val)} disabled={!form.state}>
                          <SelectTrigger>
                            <SelectValue placeholder={form.state ? "Select City" : "Select state first"} />
                          </SelectTrigger>
                          <SelectContent className="bg-white max-h-60 z-50">
                            {(form.state ? indiaStatesAndCities[form.state] || [] : []).map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button onClick={savePersonalDetails} className="bg-accent text-accent-foreground hover:bg-accent/90">
                        Next: Vehicle Details →
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck size={18} className="text-accent" />
                      <CardTitle className="text-base">Vehicle Details</CardTitle>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                        <Input id="vehicleNumber" value={form.vehicleNumber} onChange={(e) => updateField("vehicleNumber", e.target.value)} placeholder="MH12AB1234" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="vehicleMakeModel">Make & Model</Label>
                        <Input id="vehicleMakeModel" value={form.vehicleMakeModel} onChange={(e) => updateField("vehicleMakeModel", e.target.value)} placeholder="e.g. Tata Ace" />
                      </div>
                    </div>
                    <div className="flex justify-between pt-2">
                      <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
                      <Button onClick={saveVehicleDetails} className="bg-accent text-accent-foreground hover:bg-accent/90">
                        Next: Tyre Details →
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingBag size={18} className="text-accent" />
                      <CardTitle className="text-base">Tyre Purchase Details</CardTitle>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="tyreDetails">Tyre Details</Label>
                        <Input id="tyreDetails" value={form.tyreDetails} onChange={(e) => updateField("tyreDetails", e.target.value)} placeholder="e.g. BKT Agrimax RT657" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="numberOfTyres">Number of Tyres</Label>
                        <Input id="numberOfTyres" type="number" min="1" value={form.numberOfTyres} onChange={(e) => updateField("numberOfTyres", e.target.value)} placeholder="1" />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="invoiceNumber">Invoice Number (Optional)</Label>
                        <Input id="invoiceNumber" value={form.invoiceNumber} onChange={(e) => updateField("invoiceNumber", e.target.value)} placeholder="INV..." />
                      </div>
                    </div>
                    <div className="flex justify-between pt-2">
                      <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
                      <Button onClick={saveTyreDetails} className="bg-accent text-accent-foreground hover:bg-accent/90">
                        Complete & Select Plan →
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
