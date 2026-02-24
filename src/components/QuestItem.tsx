import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

interface QuestItemProps {
  id: string;
  text: string;
  completed: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const QuestItem = ({ id, text, completed, onToggle, onDelete }: QuestItemProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 p-2.5 border group cursor-pointer transition-all duration-200 ${
        completed
          ? "border-primary/20 bg-primary/5 opacity-60"
          : "border-window-border/30 bg-window-inner hover:bg-primary/10 hover:border-primary/40"
      }`}
      onClick={() => onToggle(id)}
    >
      <div
        className={`w-4 h-4 flex-shrink-0 border-2 flex items-center justify-center text-[8px] transition-all duration-200 ${
          completed
            ? "border-primary bg-primary shadow-[0_0_8px_hsl(280_70%_65%/0.4)]"
            : "border-window-border bg-window-inner hover:border-primary/60"
        }`}
      >
        {completed && <span className="text-primary-foreground">♥</span>}
      </div>

      <span className={`text-[8px] ${completed ? "text-primary/50" : "text-accent"}`}>
        {completed ? "✦" : "▸"}
      </span>

      <span
        className={`flex-1 min-w-0 break-words text-[9px] leading-relaxed ${
          completed ? "line-through text-muted-foreground" : "text-foreground"
        }`}
      >
        {text}
      </span>

      {completed && (
        <motion.span
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          className="w-full sm:w-auto text-[7px] text-star text-pixel-shadow whitespace-nowrap"
        >
          +10 XP ★
        </motion.span>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(id);
        }}
        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 p-0.5 ml-auto"
      >
        <Trash2 size={11} />
      </button>
    </motion.div>
  );
};

export default QuestItem;
