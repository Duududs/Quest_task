import { ReactNode } from "react";

interface RetroWindowProps {
  title: string;
  children: ReactNode;
  className?: string;
  hearts?: number;
}

const RetroWindow = ({ title, children, className = "", hearts = 3 }: RetroWindowProps) => {
  return (
    <div className={`bg-window border-2 border-window-border window-shadow relative pixel-scanlines ${className}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b-2 border-window-border"
        style={{
          background: "linear-gradient(90deg, hsl(280 60% 50% / 0.3), hsl(320 60% 55% / 0.2), hsl(280 60% 50% / 0.3))",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-muted-foreground">■</span>
          <span className="text-[9px] text-window-title text-pixel-shadow tracking-wider">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: hearts }).map((_, i) => (
            <span
              key={i}
              className="text-heart text-[10px] drop-shadow-[0_0_4px_hsl(340_80%_60%/0.5)]"
              style={{
                animationDelay: `${i * 0.3}s`,
                animation: "heart-beat 1.5s ease-in-out infinite",
              }}
            >
              ♥
            </span>
          ))}
          <span className="text-[8px] text-muted-foreground ml-1">▫ ▪ ×</span>
        </div>
      </div>
      <div className="m-2 p-3 bg-window-inner border border-window-border/30 relative">
        {children}
      </div>
    </div>
  );
};

export default RetroWindow;
