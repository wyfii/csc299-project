"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  const [squares, setSquares] = useState<{ id: number; x: number; y: number; size: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    // Generate more squares for dense background effect
    const newSquares = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 200 + 100,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 15,
    }));
    setSquares(newSquares);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-black">
      {/* Animated squares */}
      {squares.map((square) => (
        <motion.div
          key={square.id}
          className="absolute"
          style={{
            left: `${square.x}%`,
            top: `${square.y}%`,
            width: square.size,
            height: square.size,
          }}
          initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
          animate={{
            opacity: [0, 0.15, 0.08, 0],
            scale: [0.5, 1.5, 2, 2.5],
            rotate: [0, 90, 180, 270, 360],
            x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50, Math.random() * 100 - 50],
          }}
          transition={{
            duration: square.duration,
            delay: square.delay,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
          }}
        >
          <div className="w-full h-full border border-orange-500/20 bg-orange-500/5 backdrop-blur-sm" />
        </motion.div>
      ))}
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10" />
    </div>
  );
}
