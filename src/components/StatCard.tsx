import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  variant?: "default" | "accent" | "success" | "info";
}

const variantStyles = {
  default: "bg-card text-card-foreground",
  accent: "bg-accent/10 border-accent/30",
  success: "bg-success/10 border-success/30",
  info: "bg-info/10 border-info/30",
};

const iconVariant = {
  default: "text-muted-foreground",
  accent: "text-accent",
  success: "text-success",
  info: "text-info",
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  variant = "default",
}) => {
  return (
    <Card className={`shadow-card border ${variantStyles[variant]}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${iconVariant[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
