import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { plans } from "@/data/mockData";
import { Check, Star, CreditCard, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const PlanSelection: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"confirm" | "processing" | "success">("confirm");
  const [orderDetails, setOrderDetails] = useState<{ orderId: string; plan: typeof plans[0] } | null>(null);

  const customerCode = searchParams.get("customer") || "";
  const dealerCode = searchParams.get("dealer") || "DLR12345";
  const customerMobile = searchParams.get("mobile") || "";
  const customerName = searchParams.get("name") || "";

  const handlePayment = () => {
    if (!selectedPlan) return;
    setShowPaymentDialog(true);
    setPaymentStep("confirm");
  };

  const processPayment = async () => {
    const plan = plans.find((p) => p.id === selectedPlan)!;
    setPaymentStep("processing");

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

    try {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + (plan.duration.includes("12") ? 12 : 6));

      const simulatedTxnId = "DEMO_" + Date.now().toString(36).toUpperCase();

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
    } finally {
      setProcessing(false);
    }
  };

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
              <Button variant="outline" onClick={() => navigate("/")}>
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const currentPlan = plans.find((p) => p.id === selectedPlan);

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
                  <CardDescription>{plan.duration}</CardDescription>
                  <div className="text-3xl font-bold mt-2">₹{plan.price}</div>
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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center pb-8">
            <Button
              size="lg"
              onClick={handlePayment}
              disabled={processing}
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-accent gap-2 px-8"
            >
              <CreditCard size={18} />
              {processing ? "Processing..." : `Pay ₹${plans.find((p) => p.id === selectedPlan)?.price} Now`}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Demo Payment · Simulated Flow</p>
          </motion.div>
        )}
      </div>

      {/* Simulated Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={(open) => { if (!open && paymentStep === "confirm") setShowPaymentDialog(false); }}>
        <DialogContent className="sm:max-w-md">
          {paymentStep === "confirm" && currentPlan && (
            <>
              <DialogHeader>
                <DialogTitle>Confirm Payment</DialogTitle>
                <DialogDescription>Review your order before proceeding</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-4">
                <div className="bg-secondary rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span className="font-semibold">{currentPlan.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-semibold">{currentPlan.duration}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span className="font-semibold">{customerName || "Guest"}</span></div>
                  <div className="border-t pt-2 flex justify-between font-bold text-base"><span>Total</span><span>₹{currentPlan.price}</span></div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
                <Button onClick={processPayment} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                  <CreditCard size={16} /> Pay ₹{currentPlan.price}
                </Button>
              </DialogFooter>
            </>
          )}
          {paymentStep === "processing" && (
            <div className="py-12 text-center space-y-4">
              <Loader2 size={48} className="mx-auto animate-spin text-accent" />
              <p className="font-semibold text-lg">Processing Payment...</p>
              <p className="text-sm text-muted-foreground">Please wait while we confirm your payment</p>
            </div>
          )}
          {paymentStep === "success" && (
            <div className="py-12 text-center space-y-4">
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
