import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaretDown } from "@phosphor-icons/react";

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

export function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  children,
  badge,
  badgeColor = "#10B981",
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="glass-card overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/10 transition-colors touch-feedback"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span className="font-semibold">{title}</span>
          {badge && (
            <span
              className="text-xs px-2 py-0.5"
              style={{
                backgroundColor: `${badgeColor}20`,
                color: badgeColor,
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <CaretDown size={20} className="text-muted-foreground" weight="bold" />
        </motion.div>
      </button>

      {/* Content - Collapsible */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-border/30">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
