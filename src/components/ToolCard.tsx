import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  isSelected: boolean;
  onClick: () => void;
}

export function ToolCard({
  icon: Icon,
  title,
  description,
  color,
  isSelected,
  onClick,
}: ToolCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative p-4 md:p-6 rounded-2xl border-2 transition-all text-left w-full ${
        isSelected
          ? "border-opacity-100 bg-opacity-10"
          : "border-opacity-30 bg-opacity-5 hover:border-opacity-50"
      }`}
      style={{
        borderColor: color,
        backgroundColor: isSelected ? `${color}15` : `${color}05`,
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          className="absolute top-3 right-3 w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}

      {/* Icon */}
      <div
        className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mb-3 md:mb-4"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon size={24} className="md:hidden" style={{ color }} />
        <Icon size={28} className="hidden md:block" style={{ color }} />
      </div>

      {/* Title */}
      <h3 className="text-base md:text-lg font-bold mb-1 md:mb-2">{title}</h3>

      {/* Description */}
      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-3 md:line-clamp-none">
        {description}
      </p>

      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${color}10 0%, transparent 70%)`,
        }}
        whileHover={{ opacity: 1 }}
      />
    </motion.button>
  );
}
