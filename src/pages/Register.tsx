import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import StepIndicator from "@/components/StepIndicator";
import { CheckCircle, Truck, User, ShoppingBag } from "lucide-react";

const steps = ["Customer Info", "Vehicle & Purchase", "OTP Verify", "Complete"];

const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const dealerCode = searchParams.get("dealer") || "DLR12345";

  const [step, setStep] = useState(0);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    city: "",
    vehicleNumber: "",
    vehicleMakeModel: "",
    tyreDetails: "",
    invoiceNumber: "",
  });

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleNext = () => {
    if (step === 0) {
      if (!form.name || !form.mobile || !form.city) {
        toast({ title: "Missing fields", description: "Please fill all mandatory fields.", variant: "destructive" });
        return;
      }
      if (!/^\d{10}$/.test(form.mobile)) {
        toast({ title: "Invalid mobile", description: "Enter a valid 10-digit mobile number.", variant: "destructive" });
        return;
      }
    }
    if (step === 1) {
      if (!form.vehicleNumber) {
        toast({ title: "Missing field", description: "Vehicle number is mandatory.", variant: "destructive" });
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const sendOtp = () => {
    setOtpSent(true);
    toast({ title: "OTP Sent", description: `OTP sent to ${form.mobile}. Use 1234 for demo.` });
  };

  const verifyOtp = () => {
    if (otp === "1234") {
      setStep(3);
      toast({ title: "Registration Successful!", description: "Your profile has been created." });
    } else {
      toast({ title: "Invalid OTP", description: "Please enter the correct OTP.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="bg-primary text-primary-foreground py-10 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold mb-2">TAAS Customer Registration</h1>
          <p className="text-sm opacity-80">
            Register for BKT Crossroads Tyre Assistance & Service Subscription
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
                <span className="text-xs text-muted-foreground ml-auto">(Auto-filled, non-editable)</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {step === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={18} className="text-accent" />
                    <CardTitle className="text-base">Customer Details</CardTitle>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Name *</Label>
                      <Input id="name" value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Full Name" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="mobile">Mobile Number *</Label>
                      <Input id="mobile" value={form.mobile} onChange={(e) => updateField("mobile", e.target.value)} placeholder="10-digit number" maxLength={10} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input id="email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="email@example.com" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="city">City *</Label>
                      <Input id="city" value={form.city} onChange={(e) => updateField("city", e.target.value)} placeholder="City" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={handleNext} className="bg-accent text-accent-foreground hover:bg-accent/90">
                      Next: Vehicle Details →
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck size={18} className="text-accent" />
                    <CardTitle className="text-base">Vehicle & Purchase Details</CardTitle>
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
                    <div className="space-y-1.5">
                      <Label htmlFor="tyreDetails">Tyre Details</Label>
                      <Input id="tyreDetails" value={form.tyreDetails} onChange={(e) => updateField("tyreDetails", e.target.value)} placeholder="e.g. BKT Agrimax RT657" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="invoiceNumber">Invoice Number</Label>
                      <Input id="invoiceNumber" value={form.invoiceNumber} onChange={(e) => updateField("invoiceNumber", e.target.value)} placeholder="INV..." />
                    </div>
                  </div>
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" onClick={() => setStep(0)}>← Back</Button>
                    <Button onClick={handleNext} className="bg-accent text-accent-foreground hover:bg-accent/90">
                      Next: Verify OTP →
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag size={18} className="text-accent" />
                    <CardTitle className="text-base">OTP Verification</CardTitle>
                  </div>
                  <CardDescription>
                    We'll send an OTP to <strong>{form.mobile}</strong> to verify your identity.
                  </CardDescription>
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
                      <Button onClick={verifyOtp} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        Verify & Register
                      </Button>
                      <button onClick={sendOtp} className="text-sm text-muted-foreground hover:text-foreground w-full text-center">
                        Resend OTP
                      </button>
                    </div>
                  )}
                  <div className="flex justify-start pt-2">
                    <Button variant="outline" onClick={() => { setStep(1); setOtpSent(false); }}>← Back</Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-6">
                  <CheckCircle size={56} className="mx-auto text-success" />
                  <h2 className="text-xl font-bold">Registration Complete!</h2>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    Your customer code is <strong>CUS{Math.floor(10000 + Math.random() * 90000)}</strong>. 
                    A link to select your subscription plan has been sent to {form.mobile}.
                  </p>
                  <Button onClick={() => navigate("/plans")} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Select a Plan →
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
