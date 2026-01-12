import { motion } from "framer-motion";
import { Github, ExternalLink } from "lucide-react";
import tetsuoLogo from "@/assets/tetsuo-logo.jpg";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      className="border-t border-border/30 mt-16 py-8"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm">Powered by</span>
            <a 
              href="https://tetsuo.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src={tetsuoLogo} alt="TETSUO" className="w-8 h-8 rounded-full" />
              <span className="font-semibold">TETSUO</span>
              <span className="text-muted-foreground">on Solana</span>
            </a>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/solprivacy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <Github size={18} />
              <span>GitHub</span>
              <ExternalLink size={14} />
            </a>
            <span className="text-muted-foreground text-sm">v1.0.0</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
