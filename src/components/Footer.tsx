import { GithubLogo } from "@phosphor-icons/react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="w-full px-4 sm:px-8 lg:px-20 py-4 sm:py-0 sm:h-20 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#2A2A2A] bg-[#141414] safe-bottom">
      <div className="flex items-center gap-3 sm:gap-6">
        <Logo size="sm" showText={false} />
        <span className="text-xs sm:text-sm font-bold tracking-[0.1em] sm:tracking-[0.15em] text-white">SOLPRIVACY</span>
        <span className="text-[10px] sm:text-xs text-[#5A5A5A]">© 2026</span>
      </div>
      <div className="flex items-center gap-4 sm:gap-8">
        {/* Hide partners on mobile, show on desktop */}
        <div className="hidden md:flex items-center gap-8">
          {["HELIUS", "LIGHT PROTOCOL", "ARCIUM"].map((partner) => (
            <span key={partner} className="text-[11px] font-medium tracking-[0.15em] text-[#5A5A5A]">
              {partner}
            </span>
          ))}
        </div>
        <a
          href="https://github.com/Pavelevich/shadow-tracker"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 touch-feedback"
        >
          <GithubLogo size={20} className="text-[#8A8A8A] hover:text-white transition-colors" weight="bold" />
        </a>
      </div>
    </footer>
  );
}
