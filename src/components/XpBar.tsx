import { motion } from "framer-motion";

interface XpBarProps {
  xp: number;
  level: number;
  xpToNext: number;
}

const XpBar = ({ xp, level, xpToNext }: XpBarProps) => {
  const percentage = Math.min((xp / xpToNext) * 100, 100);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-primary glow-text">
          ★ LVL {level}
        </span>
        <span className="text-muted-foreground text-[8px]">
          {xp}/{xpToNext} XP
        </span>
      </div>
      <div className="h-5 w-full bg-muted border-2 border-window-border relative overflow-hidden">
        <motion.div
          className="h-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            background: "linear-gradient(90deg, hsl(280 70% 55%), hsl(320 60% 55%), hsl(280 70% 65%))",
            backgroundSize: "200% 100%",
            animation: "pulse-glow 2s ease-in-out infinite",
            boxShadow: "0 0 10px hsl(280 70% 65% / 0.3)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[8px] text-primary-foreground text-pixel-shadow">
            {Math.round(percentage)}%
          </span>
        </div>
        <div className="absolute inset-0 flex" style={{ gap: "1px" }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex-1 border-r border-window-inner/20 last:border-r-0" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default XpBar;
