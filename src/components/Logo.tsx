import { Shield, Eye } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

export function Logo({ size = "md" }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: "text-lg" },
    md: { icon: 28, text: "text-2xl" },
    lg: { icon: 40, text: "text-4xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Shield size={icon} className="text-primary" strokeWidth={2} />
        <Eye 
          size={icon * 0.4} 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" 
          strokeWidth={2.5}
        />
      </div>
      <span className={`font-bold ${text} tracking-tight`}>
        <span className="text-foreground">Sol</span>
        <span className="text-gradient-primary">Privacy</span>
      </span>
    </div>
  );
}
