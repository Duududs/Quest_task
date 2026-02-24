import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import RetroWindow from "@/components/RetroWindow";
import XpBar from "@/components/XpBar";
import QuestItem from "@/components/QuestItem";
import FloatingPixels from "@/components/FloatingPixels";

interface Quest {
  id: string;
  text: string;
  completed: boolean;
}

interface StoredQuestState {
  quests: Quest[];
  totalXp: number;
}

const XP_PER_QUEST = 10;
const XP_PER_LEVEL = 50;
const CAT_IDLE_SRC = "/Cat01.png";
const CAT_WRITING_SRC = "/Cat02.gif";
const TYPING_IDLE_DELAY_MS = 80;
const CONFETTI_DURATION_MS = 1200;
const CONFETTI_COUNT = 36;
const QUEST_STORAGE_KEY = "pixel-quest-state:v1";
const DEFAULT_TOTAL_XP = 10;
const DEFAULT_QUESTS: Quest[] = [
  { id: "1", text: "Explorar a dungeon do código", completed: false },
  { id: "2", text: "Derrotar o bug final", completed: false },
  { id: "3", text: "Coletar todos os itens", completed: true },
];

interface ConfettiParticle {
  x: number;
  dx: number;
  dy: number;
  rotate: number;
  delay: number;
  color: string;
}

const getDefaultStoredState = (): StoredQuestState => ({
  quests: DEFAULT_QUESTS.map((quest) => ({ ...quest })),
  totalXp: DEFAULT_TOTAL_XP,
});

const readStoredState = (): StoredQuestState => {
  if (typeof window === "undefined") return getDefaultStoredState();

  try {
    const rawState = window.localStorage.getItem(QUEST_STORAGE_KEY);
    if (!rawState) return getDefaultStoredState();

    const parsed = JSON.parse(rawState) as Partial<StoredQuestState>;
    const quests = Array.isArray(parsed.quests)
      ? parsed.quests
          .filter(
            (quest): quest is Quest =>
              typeof quest?.id === "string" &&
              typeof quest?.text === "string" &&
              typeof quest?.completed === "boolean",
          )
          .map((quest) => ({ ...quest }))
      : getDefaultStoredState().quests;

    const totalXp =
      typeof parsed.totalXp === "number" && Number.isFinite(parsed.totalXp)
        ? Math.max(0, Math.floor(parsed.totalXp))
        : DEFAULT_TOTAL_XP;

    return {
      quests: quests.length > 0 ? quests : getDefaultStoredState().quests,
      totalXp,
    };
  } catch {
    return getDefaultStoredState();
  }
};

const LevelUpConfetti = ({ burstId }: { burstId: number }) => {
  const particles = useMemo<ConfettiParticle[]>(
    () =>
      Array.from({ length: CONFETTI_COUNT }, () => ({
        x: 35 + Math.random() * 30,
        dx: -180 + Math.random() * 360,
        dy: 140 + Math.random() * 200,
        rotate: -360 + Math.random() * 720,
        delay: Math.random() * 0.18,
        color: [
          "hsl(272 55% 56%)",
          "hsl(334 56% 60%)",
          "hsl(42 100% 38%)",
          "hsl(200 90% 70%)",
        ][Math.floor(Math.random() * 4)],
      })),
    [burstId],
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {particles.map((particle, index) => (
        <motion.span
          key={`${burstId}-${index}`}
          className="absolute block h-3 w-1.5 rounded-[1px]"
          style={{
            left: `${particle.x}%`,
            top: "42%",
            backgroundColor: particle.color,
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            x: particle.dx,
            y: particle.dy,
            opacity: 0,
            rotate: particle.rotate,
            scale: 0.8,
          }}
          transition={{ duration: 1, ease: "easeOut", delay: particle.delay }}
        />
      ))}
    </div>
  );
};

const Index = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiBurstId, setConfettiBurstId] = useState(0);
  const [quests, setQuests] = useState<Quest[]>([
    { id: "1", text: "Explorar a dungeon do código", completed: false },
    { id: "2", text: "Derrotar o bug final", completed: false },
    { id: "3", text: "Coletar todos os itens", completed: true },
  ]);
  const [input, setInput] = useState("");
  const [totalXp, setTotalXp] = useState(10);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const storedState = readStoredState();
    setQuests(storedState.quests);
    setTotalXp(storedState.totalXp);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isTyping) return;
    const timeout = window.setTimeout(
      () => setIsTyping(false),
      TYPING_IDLE_DELAY_MS,
    );
    return () => window.clearTimeout(timeout);
  }, [input, isTyping]);

  useEffect(() => {
    if (!isHydrated) return;
    if (typeof window === "undefined") return;
    const payload: StoredQuestState = { quests, totalXp };
    window.localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(payload));
  }, [isHydrated, quests, totalXp]);

  const isLight = theme === "light";

  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const previousLevelRef = useRef(level);
  const xpInLevel = totalXp % XP_PER_LEVEL;
  const completedCount = quests.filter((q) => q.completed).length;
  const activeQuests = quests.filter((q) => !q.completed);
  const completedQuests = quests.filter((q) => q.completed);

  const addQuest = useCallback(() => {
    if (!input.trim()) return;
    setQuests((prev) => [
      ...prev,
      { id: Date.now().toString(), text: input.trim(), completed: false },
    ]);
    setInput("");
    setIsTyping(false);
  }, [input]);

  const toggleQuest = useCallback((id: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const newCompleted = !q.completed;
          setTotalXp(
            (xp) => xp + (newCompleted ? XP_PER_QUEST : -XP_PER_QUEST),
          );
          return { ...q, completed: newCompleted };
        }
        return q;
      }),
    );
  }, []);

  const deleteQuest = useCallback((id: string) => {
    setQuests((prev) => {
      const quest = prev.find((q) => q.id === id);
      if (quest?.completed) {
        setTotalXp((xp) => Math.max(0, xp - XP_PER_QUEST));
      }
      return prev.filter((q) => q.id !== id);
    });
  }, []);

  useEffect(() => {
    if (level > previousLevelRef.current) {
      setConfettiBurstId((value) => value + 1);
      setShowConfetti(true);
      const timeout = window.setTimeout(
        () => setShowConfetti(false),
        CONFETTI_DURATION_MS,
      );
      previousLevelRef.current = level;
      return () => window.clearTimeout(timeout);
    }

    previousLevelRef.current = level;
  }, [level]);

  return (
    <div
      className="min-h-dvh overflow-x-hidden overflow-y-auto box-border px-3 py-4 pb-24 sm:px-4 md:px-8 md:py-8 md:pb-8 flex flex-col items-center relative"
    >
      <FloatingPixels />
      {showConfetti && <LevelUpConfetti burstId={confettiBurstId} />}
      <img
        src={isTyping ? CAT_WRITING_SRC : CAT_IDLE_SRC}
        alt={isTyping ? "Cat writing animation" : "Cat idle"}
        className="hidden lg:block fixed -bottom-[66px] right-0 w-52 h-auto z-20 pointer-events-none select-none"
      />

      <div className="w-full max-w-2xl relative z-10 space-y-5">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative text-center space-y-3 pt-6"
        >
          <div className="relative flex items-center justify-center gap-2 sm:gap-3">
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(isLight ? "dark" : "light")}
                className="absolute right-0 sm:right-1 top-1/2 -translate-y-1/2 p-0 bg-transparent border-0 text-primary hover:text-accent transition-colors"
                aria-label={
                  isLight ? "Ativar modo escuro" : "Ativar modo claro"
                }
                title={isLight ? "Ativar modo escuro" : "Ativar modo claro"}
              >
                {isLight ? <Moon size={16} /> : <Sun size={16} />}
              </button>
            )}
            <motion.span
              className="text-heart text-sm"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ♥
            </motion.span>
            <h1 className="text-base md:text-lg text-primary glow-text tracking-widest animate-float">
              QUEST LOG
            </h1>
            <motion.span
              className="text-heart text-sm"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            >
              ♥
            </motion.span>
          </div>
          <p className="text-[8px] text-muted-foreground">
            ✧ {completedCount}/{quests.length} missões completas ✧
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="md:col-span-2 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <RetroWindow title="QUESTS.EXE">
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setIsTyping(true);
                    }}
                    onBlur={() => setIsTyping(false)}
                    onKeyDown={(e) => e.key === "Enter" && addQuest()}
                    placeholder="Nova missão..."
                    className="flex-1 bg-muted text-foreground px-2 py-1.5 text-[9px] border-2 border-window-border/40 placeholder:text-muted-foreground focus:outline-none focus:border-primary/70 focus:shadow-[0_0_8px_hsl(280_70%_65%/0.2)] transition-all"
                  />
                  <button
                    onClick={addQuest}
                    className="w-full sm:w-auto bg-primary text-primary-foreground px-3 py-1.5 text-[9px] border-2 border-window-border hover:brightness-125 active:translate-y-[1px] transition-all shadow-[0_0_10px_hsl(280_70%_65%/0.2)]"
                  >
                    + ADD
                  </button>
                </div>

                <div className="space-y-1.5">
                  <AnimatePresence mode="popLayout">
                    {activeQuests.length === 0 &&
                      completedQuests.length === 0 && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center text-muted-foreground text-[9px] py-6"
                        >
                          Nenhuma missão... adicione uma! ♥
                        </motion.p>
                      )}
                    {activeQuests.map((quest) => (
                      <QuestItem
                        key={quest.id}
                        {...quest}
                        onToggle={toggleQuest}
                        onDelete={deleteQuest}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </RetroWindow>
            </motion.div>

            {completedQuests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <RetroWindow title="COMPLETE.EXE" hearts={2}>
                  <div className="space-y-1.5">
                    <AnimatePresence mode="popLayout">
                      {completedQuests.map((quest) => (
                        <QuestItem
                          key={quest.id}
                          {...quest}
                          onToggle={toggleQuest}
                          onDelete={deleteQuest}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </RetroWindow>
              </motion.div>
            )}
          </div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <RetroWindow title="STATUS.EXE" hearts={2}>
                <XpBar xp={xpInLevel} level={level} xpToNext={XP_PER_LEVEL} />
                <div className="mt-3 text-[8px] text-muted-foreground text-center">
                  ★ Complete missões para ganhar XP! ★
                </div>
              </RetroWindow>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <RetroWindow title="STATS.EXE" hearts={1}>
                <div className="space-y-2 text-[9px]">
                  {[
                    { label: "Total", value: quests.length, glow: true },
                    { label: "Ativas", value: activeQuests.length },
                    { label: "Completas", value: completedCount, accent: true },
                    { label: "XP Total", value: totalXp, glow: true },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center border-b border-window-border/20 pb-1.5 last:border-b-0"
                    >
                      <span className="text-muted-foreground">
                        ▸ {stat.label}
                      </span>
                      <span
                        className={
                          stat.glow
                            ? "text-primary glow-text"
                            : stat.accent
                              ? "text-accent"
                              : "text-foreground"
                        }
                      >
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </RetroWindow>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <RetroWindow title="DICAS.EXE" hearts={1}>
                {[
                  "Clique em uma missão para completá-la",
                  "Cada missão vale +10 XP",
                  "Suba de nível a cada 50 XP!",
                ].map((tip, i) => (
                  <p
                    key={i}
                    className="text-[8px] text-muted-foreground leading-relaxed mt-1 first:mt-0"
                  >
                    <span className="text-heart">♥</span> {tip}
                  </p>
                ))}
              </RetroWindow>
            </motion.div>
          </div>
        </div>

        <div className="text-center text-[7px] text-muted-foreground/60 py-4">
          <span className="animate-blink-cursor">▮</span>{" "}
          <span className="text-primary/40">SYSTEM</span>_READY_{" "}
          <span className="animate-blink-cursor">▮</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
