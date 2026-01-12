import { motion } from "framer-motion";

export function LoadingSkeleton() {
  return (
    <div className="py-12 space-y-8">
      {/* Score skeleton */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-8 md:p-12 max-w-3xl mx-auto"
      >
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <div className="w-[280px] h-[280px] rounded-full bg-muted animate-pulse" />
          <div className="space-y-6">
            <div className="h-24 w-24 rounded-lg bg-muted animate-pulse" />
            <div className="h-10 w-32 rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
      </motion.div>

      {/* Attack simulation skeleton */}
      <div className="glass-card p-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-muted/20">
              <div className="h-6 w-3/4 bg-muted rounded animate-pulse mb-3" />
              <div className="h-2 w-full bg-muted rounded animate-pulse mb-3" />
              <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Metrics skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="glass-card p-5">
            <div className="h-5 w-24 bg-muted rounded animate-pulse mb-3" />
            <div className="h-8 w-16 bg-muted rounded animate-pulse mb-3" />
            <div className="h-1.5 w-full bg-muted rounded animate-pulse mb-3" />
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
