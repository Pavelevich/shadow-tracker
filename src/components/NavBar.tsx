import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Zap, Trash2 } from "lucide-react";
import { Logo } from "./Logo";

const NAV_ITEMS = [
  { path: "/", label: "Privacy", icon: Shield, color: "#14f195" },
  { path: "/mev", label: "MEV Shield", icon: Zap, color: "#f59e0b" },
  { path: "/dust", label: "Dust Cleaner", icon: Trash2, color: "#ef4444" },
];

export function NavBar() {
  const location = useLocation();

  // Determine active path (handle /analyze/:wallet patterns)
  const getActivePath = () => {
    if (location.pathname.startsWith("/analyze")) return "/";
    if (location.pathname.startsWith("/mev")) return "/mev";
    if (location.pathname.startsWith("/dust")) return "/dust";
    return "/";
  };

  const activePath = getActivePath();

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
      <div className="container mx-auto px-3 md:px-4">
        <div className="flex items-center justify-between h-12 md:h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Logo size="sm" />
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-0.5 md:gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activePath === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative px-2 md:px-3 py-1.5 rounded-lg transition-colors"
                >
                  <div
                    className={`flex items-center gap-1.5 text-xs md:text-sm font-medium ${
                      isActive ? "text-white" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    {Icon && (
                      <Icon
                        size={14}
                        className="md:w-4 md:h-4"
                        style={{ color: isActive ? item.color : undefined }}
                      />
                    )}
                    <span className="hidden sm:inline">{item.label}</span>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-lg -z-10"
                      style={{ backgroundColor: `${item.color}20` }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
