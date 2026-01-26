interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-2xl" },
    lg: { icon: 48, text: "text-4xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <img src="/logo.svg" alt="SolPrivacy" width={icon} height={icon} />
      {showText && (
        <span className={`font-bold ${text} tracking-[0.1em] text-white`}>
          SOLPRIVACY
        </span>
      )}
    </div>
  );
}
