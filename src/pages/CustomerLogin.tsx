import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Phone, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import bktLogo from "@/assets/bkt-logo.png";

const CustomerLogin: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOtp = () => {
    if (!/^\d{10}$/.test(mobile)) {
      toast({ title: "Invalid mobile", description: "Enter a valid 10-digit mobile number.", variant: "destructive" });
      return;
    }
    setOtpSent(true);
    toast({ title: "OTP Sent", description: `OTP sent to ${mobile}. Use 1234 for demo.` });
  };

  const verifyAndLogin = async () => {
    if (otp !== "1234") {
      toast({ title: "Invalid OTP", description: "Please enter the correct OTP.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // Check if customer exists with an active subscription
      const { data: customers } = await supabase
        .from("customers")
        .select("*")
        .eq("mobile_number", mobile)
        .order("created_at", { ascending: false });

      if (!customers || customers.length === 0) {
        toast({ title: "Not Found", description: "No registration found for this mobile number. Please register first.", variant: "destructive" });
        setLoading(false);
        return;
      }

      const customer = customers.find(c => c.customer_name !== c.mobile_number && c.city !== "—") || customers[0];

      // Store customer session in localStorage
      localStorage.setItem("customer_session", JSON.stringify({
        customer_code: customer.customer_code,
        customer_name: customer.customer_name,
        mobile_number: customer.mobile_number,
        email: customer.email,
        state: customer.state,
        city: customer.city,
        vehicle_number: customer.vehicle_number,
        vehicle_make_model: customer.vehicle_make_model,
        dealer_code: customer.dealer_code,
      }));

      toast({ title: "Login Successful!", description: `Welcome back, ${customer.customer_name}!` });
      navigate("/customer/dashboard");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <Card className="shadow-elevated">
          <CardHeader className="text-center space-y-3">
            <img src={bktLogo} alt="BKT Logo" className="h-12 mx-auto" />
            <CardTitle className="text-xl">Customer Login</CardTitle>
            <p className="text-sm text-muted-foreground">Login with your registered mobile number</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="mobile" className="flex items-center gap-2">
                <Phone size={14} /> Mobile Number
              </Label>
              <Input
                id="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                disabled={otpSent}
              />
            </div>

            {!otpSent ? (
              <Button onClick={sendOtp} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                <Shield size={16} /> Send OTP
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 4-digit OTP"
                    maxLength={4}
                    className="text-center text-lg tracking-widest"
                  />
                </div>
                <Button onClick={verifyAndLogin} disabled={loading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  {loading ? "Verifying..." : "Login"}
                </Button>
                <button onClick={sendOtp} className="text-sm text-muted-foreground hover:text-foreground w-full text-center">
                  Resend OTP
                </button>
              </div>
            )}

            <p className="text-xs text-center text-muted-foreground pt-2">
              Not registered yet?{" "}
              <button onClick={() => navigate("/")} className="text-primary font-medium hover:underline">
                Register here
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CustomerLogin;
