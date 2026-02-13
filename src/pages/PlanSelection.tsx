import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { plans } from "@/data/mockData";
import { Check, Star, CreditCard, CheckCircle } from "lucide-react";

const PlanSelection: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);

  const handlePayment = () => {
    if (!selectedPlan) return;
    // Simulate payment
    toast({ title: "Processing Payment...", description: "Please wait." });
    setTimeout(() => {
      setPaymentDone(true);
      toast({ title: "Payment Successful!", description: "Your subscription is now active." });
    }, 1500);
  };

  if (paymentDone) {
    const plan = plans.find((p) => p.id === selectedPlan)!;
    return (
      <div className="min-h-[calc(100vh-64px)] bg-background flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="max-w-md shadow-elevated text-center">
            <CardContent className="py-10 space-y-4">
              <CheckCircle size={64} className="mx-auto text-success" />
              <h2 className="text-2xl font-bold">Subscription Activated!</h2>
              <p className="text-muted-foreground">
                You're now enrolled in the <strong>{plan.name}</strong>.
              </p>
              <div className="bg-secondary rounded-lg p-4 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Order ID</span><span className="font-semibold">ORD{Math.floor(10000 + Math.random() * 90000)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Amount Paid</span><span className="font-semibold">₹{plan.price}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Validity</span><span className="font-semibold">{plan.duration}</span></div>
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

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="bg-primary text-primary-foreground py-10 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-2xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-sm opacity-80">Select a TAAS subscription plan that fits your needs</p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 -mt-6">
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all shadow-card hover:shadow-elevated relative ${
                  selectedPlan === plan.id
                    ? "ring-2 ring-accent shadow-accent"
                    : ""
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
                  <div className="text-3xl font-bold mt-2">
                    ₹{plan.price}
                  </div>
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
                    className={`w-full ${
                      selectedPlan === plan.id
                        ? "bg-accent text-accent-foreground hover:bg-accent/90"
                        : ""
                    }`}
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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center">
            <Button
              size="lg"
              onClick={handlePayment}
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-accent gap-2 px-8"
            >
              <CreditCard size={18} />
              Pay ₹{plans.find((p) => p.id === selectedPlan)?.price} Now
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PlanSelection;
