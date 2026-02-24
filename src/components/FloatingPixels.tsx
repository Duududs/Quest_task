import { motion } from "framer-motion";

const particles = [
  { x: "10%", y: "20%", delay: 0, char: "✦", size: "text-[8px]", color: "text-primary/30" },
  { x: "85%", y: "15%", delay: 1.2, char: "♥", size: "text-[6px]", color: "text-heart/30" },
  { x: "70%", y: "80%", delay: 0.6, char: "★", size: "text-[7px]", color: "text-star/30" },
  { x: "15%", y: "75%", delay: 1.8, char: "✧", size: "text-[9px]", color: "text-primary/20" },
  { x: "90%", y: "50%", delay: 0.3, char: "♥", size: "text-[5px]", color: "text-accent/25" },
  { x: "50%", y: "90%", delay: 1.5, char: "✦", size: "text-[6px]", color: "text-primary/20" },
];

const FloatingPixels = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className={`absolute ${p.size} ${p.color}`}
          style={{ left: p.x, top: p.y }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.3, 0.7, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 4,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {p.char}
        </motion.span>
      ))}
    </div>
  );
};

export default FloatingPixels;
