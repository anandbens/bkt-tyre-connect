import React, { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { plans } from "@/data/mockData";
import { Check, Star, CreditCard, CheckCircle, Loader2, Smartphone, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: "📱" },
  { id: "card", label: "Credit/Debit Card", icon: "💳" },
  { id: "netbanking", label: "Net Banking", icon: "🏦" },
  { id: "wallet", label: "Wallets", icon: "👛" },
];

const PlanSelection: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"methods" | "upi" | "processing" | "success">("methods");
  const [upiId, setUpiId] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<{ orderId: string; plan: typeof plans[0] } | null>(null);
  const [tcAccepted, setTcAccepted] = useState(false);
  const [showTcDialog, setShowTcDialog] = useState(false);
  const [tcScrolledToBottom, setTcScrolledToBottom] = useState(false);
  const tcScrollRef = useRef<HTMLDivElement>(null);

  const customerCode = searchParams.get("customer") || "";
  const dealerCode = searchParams.get("dealer") || "DLR12345";
  const customerMobile = searchParams.get("mobile") || "";
  const customerName = searchParams.get("name") || "";

  const handlePayment = () => {
    if (!selectedPlan) return;
    if (!tcAccepted) {
      toast({ title: "Terms & Conditions Required", description: "Please read and accept the Terms & Conditions before proceeding.", variant: "destructive" });
      return;
    }
    setShowPaymentDialog(true);
    setPaymentStep("methods");
    setSelectedMethod(null);
    setUpiId("");
  };

  const handleTcScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 30;
    if (isAtBottom) setTcScrolledToBottom(true);
  };

  const handleTcAgree = () => {
    setTcAccepted(true);
    setShowTcDialog(false);
    toast({ title: "Terms Accepted", description: "You have accepted the Terms & Conditions." });
  };

  const selectPaymentMethod = (methodId: string) => {
    setSelectedMethod(methodId);
    if (methodId === "upi") {
      setPaymentStep("upi");
    } else {
      // For non-UPI, go straight to processing
      processPayment();
    }
  };

  const processPayment = async () => {
    const plan = plans.find((p) => p.id === selectedPlan)!;
    setPaymentStep("processing");

    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 2);
      const simulatedTxnId = "PAY_" + Date.now().toString(36).toUpperCase();

      const { data, error } = await supabase
        .from("subscriptions")
        .insert({
          customer_code: customerCode || "GUEST",
          customer_name: customerName || "Guest Customer",
          customer_mobile: customerMobile || null,
          dealer_code: dealerCode,
          plan_id: plan.id,
          plan_name: plan.name,
          plan_price: plan.price,
          payment_status: "SUCCESS",
          payment_transaction_id: simulatedTxnId,
          order_id: "",
          subscription_end_date: endDate.toISOString().split("T")[0],
        })
        .select()
        .single();

      if (error) throw error;

      setPaymentStep("success");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setShowPaymentDialog(false);
      setOrderDetails({ orderId: data.order_id, plan });
      setPaymentDone(true);
      toast({ title: "Payment Successful!", description: "Your subscription is now active." });
    } catch (err: any) {
      setShowPaymentDialog(false);
      toast({ title: "Error saving subscription", description: err.message, variant: "destructive" });
    }
  };

  const currentPlan = plans.find((p) => p.id === selectedPlan);

  if (paymentDone && orderDetails) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="max-w-md shadow-elevated text-center">
            <CardContent className="py-10 space-y-4">
              <CheckCircle size={64} className="mx-auto text-success" />
              <h2 className="text-2xl font-bold">Subscription Activated!</h2>
              <p className="text-muted-foreground">
                You're now enrolled in the <strong>{orderDetails.plan.name}</strong>.
              </p>
              <div className="bg-secondary rounded-lg p-4 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Order ID</span><span className="font-semibold">{orderDetails.orderId}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Amount Paid</span><span className="font-semibold">₹{orderDetails.plan.price}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Validity</span><span className="font-semibold">{orderDetails.plan.duration}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge className="bg-success text-success-foreground">Active</Badge></div>
              </div>
              <Button variant="outline" onClick={() => navigate("/customer-login")}>
                Customer Login
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
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-1">Choose Your Plan</h1>
          <p className="text-xs sm:text-sm opacity-80">Select a TAAS subscription plan that fits your needs</p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 -mt-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {plans.map((plan, i) => (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card
                className={`cursor-pointer transition-all shadow-card hover:shadow-elevated relative ${
                  selectedPlan === plan.id ? "ring-2 ring-accent shadow-accent" : ""
                } ${plan.recommended ? "border-accent" : ""}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-accent text-accent-foreground gap-1">
                      <Star size={12} /> Recommended
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-6">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>Validity: {plan.duration} · {plan.totalServices} Services</CardDescription>
                  <div className="text-3xl font-bold mt-2">₹{plan.price}</div>
                  <div className="text-xs text-muted-foreground">incl. GST (Base: ₹{plan.priceBeforeGst})</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check size={16} className="text-success mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${selectedPlan === plan.id ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`}
                    variant={selectedPlan === plan.id ? "default" : "outline"}
                  >
                    {selectedPlan === plan.id ? "Selected ✓" : "Select Plan"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {selectedPlan && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center pb-8 space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Checkbox
                id="tc-check"
                checked={tcAccepted}
                onCheckedChange={(checked) => {
                  if (!checked) {
                    setTcAccepted(false);
                  } else {
                    setShowTcDialog(true);
                    setTcScrolledToBottom(false);
                  }
                }}
              />
              <label htmlFor="tc-check" className="text-sm cursor-pointer">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setShowTcDialog(true); setTcScrolledToBottom(false); }}
                  className="text-accent underline font-medium hover:text-accent/80"
                >
                  Terms & Conditions
                </button>
              </label>
            </div>
            <Button
              size="lg"
              onClick={handlePayment}
              disabled={!tcAccepted}
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-accent gap-2 px-8 disabled:opacity-50"
            >
              <CreditCard size={18} />
              {`Pay ₹${plans.find((p) => p.id === selectedPlan)?.price} Now`}
            </Button>
            <p className="text-xs text-muted-foreground">Secure Payment · Demo Mode</p>
          </motion.div>
        )}
      </div>

      {/* Terms & Conditions Dialog */}
      <Dialog open={showTcDialog} onOpenChange={setShowTcDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={20} className="text-accent" />
              Terms & Conditions
            </DialogTitle>
          </DialogHeader>
          <div
            ref={tcScrollRef}
            onScroll={handleTcScroll}
            className="flex-1 overflow-y-auto max-h-[50vh] border rounded-md p-4 text-sm text-muted-foreground space-y-3"
          >
            <h3 className="font-semibold text-foreground">BKT Crossroads TAAS – Terms & Conditions</h3>
            <p><strong>1. Service Agreement:</strong> By subscribing to the BKT Crossroads Tyre Assistance & Service (TAAS) program, you agree to be bound by these terms and conditions. The service is provided by BKT Crossroads and its authorized service partners.</p>
            <p><strong>2. Eligibility:</strong> The TAAS service is available to all customers who have purchased BKT tyres from authorized BKT dealers. A valid purchase invoice may be required for verification purposes.</p>
            <p><strong>3. Service Coverage:</strong> The TAAS program provides roadside assistance services as listed in the selected plan (Silver, Gold, or Platinum). Services are subject to availability and geographical coverage areas within India.</p>
            <p><strong>4. Subscription Validity:</strong> All subscription plans have a validity period of 2 years from the date of activation. The subscription is non-transferable and cannot be extended beyond the validity period without renewal.</p>
            <p><strong>5. Service Limits:</strong> Each subscription plan includes a maximum of 3 service requests during the validity period. Unused services cannot be carried forward or refunded.</p>
            <p><strong>6. Service Requests:</strong> To avail of services, customers must call the 24×7 helpline number provided at the time of subscription. Service response times may vary based on location, weather conditions, and availability of service partners.</p>
            <p><strong>7. Exclusions:</strong> The TAAS program does not cover: (a) damage caused by accidents, natural disasters, or acts of God; (b) services required due to misuse or negligence; (c) vehicles used for racing or competitive events; (d) commercial fleet vehicles unless specifically enrolled.</p>
            <p><strong>8. Payment & Refund:</strong> All payments are processed securely. Subscription fees are non-refundable once the plan is activated. GST and applicable taxes are included in the displayed price.</p>
            <p><strong>9. Privacy:</strong> Your personal information will be collected and stored in accordance with our Privacy Policy. Information may be shared with authorized service partners solely for the purpose of providing roadside assistance.</p>
            <p><strong>10. Limitation of Liability:</strong> BKT Crossroads and its partners shall not be liable for any indirect, incidental, or consequential damages arising from the use of TAAS services. Total liability shall not exceed the subscription fee paid.</p>
            <p><strong>11. Modification:</strong> BKT Crossroads reserves the right to modify these terms and conditions at any time. Customers will be notified of significant changes via registered mobile number or email.</p>
            <p><strong>12. Governing Law:</strong> These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.</p>
            <p><strong>13. Contact:</strong> For queries related to these terms or the TAAS service, please contact us through the helpline or visit www.crossroadshelpline.com.</p>
            <p className="text-xs text-muted-foreground/70 pt-2">Last updated: March 2026</p>
          </div>
          {!tcScrolledToBottom && (
            <p className="text-xs text-center text-muted-foreground animate-pulse">↓ Please scroll down to read all terms before agreeing ↓</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTcDialog(false)}>Cancel</Button>
            <Button
              onClick={handleTcAgree}
              disabled={!tcScrolledToBottom}
              className="bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
            >
              I Agree
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Gateway Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={(open) => { if (!open && paymentStep === "methods") setShowPaymentDialog(false); }}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          {/* Header */}
          <div className="bg-[hsl(210,70%,35%)] text-white px-5 py-4 flex items-center justify-between">
            <div>
              <div className="text-xs opacity-80">BKT Crossroads TAAS</div>
              <div className="font-bold text-lg">₹{currentPlan?.price || 0}</div>
            </div>
            <div className="text-right text-xs opacity-80">
              <div>Payment Gateway</div>
              <div className="font-medium text-sm text-white/90">Demo Mode</div>
            </div>
          </div>

          {paymentStep === "methods" && (
            <div className="p-5 space-y-3">
              <p className="text-sm font-medium text-muted-foreground mb-3">Select Payment Method</p>
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => selectPaymentMethod(m.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-secondary/50 transition-colors text-left"
                >
                  <span className="text-2xl">{m.icon}</span>
                  <span className="font-medium text-sm">{m.label}</span>
                </button>
              ))}
            </div>
          )}

          {paymentStep === "upi" && (
            <div className="p-5 space-y-4">
              <p className="text-sm font-medium text-muted-foreground">Enter UPI ID</p>
              <div className="flex items-center gap-2">
                <Smartphone size={20} className="text-muted-foreground" />
                <Input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="flex-1"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPaymentStep("methods")} className="flex-1">Back</Button>
                <Button onClick={processPayment} className="flex-1 bg-[hsl(210,70%,35%)] text-white hover:bg-[hsl(210,70%,30%)]">
                  Pay ₹{currentPlan?.price}
                </Button>
              </div>
            </div>
          )}

          {paymentStep === "processing" && (
            <div className="py-14 text-center space-y-4">
              <Loader2 size={48} className="mx-auto animate-spin text-[hsl(210,70%,35%)]" />
              <p className="font-semibold text-lg">Processing Payment...</p>
              <p className="text-sm text-muted-foreground">Please do not close this window</p>
            </div>
          )}

          {paymentStep === "success" && (
            <div className="py-14 text-center space-y-4">
              <CheckCircle size={48} className="mx-auto text-success" />
              <p className="font-semibold text-lg">Payment Successful!</p>
              <p className="text-sm text-muted-foreground">Activating your subscription...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanSelection;
