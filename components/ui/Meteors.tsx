"use client";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import React from "react";

export const Meteors = ({ number, className }: { number?: number; className?: string }) => {
  const meteors = new Array(number || 20).fill(true);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {meteors.map((_, idx) => {
        const meteorCount = number || 20;
        const position = idx * (800 / meteorCount) - 400;
        // Deterministic pseudo-random generator (stable across SSR and client)
        function mulberry32(a: number) {
          return function () {
            let t = (a += 0x6d2b79f5);
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
          };
        }
        const rng = mulberry32(0x9e3779b9 ^ (idx + meteorCount * 101));
        const delay = (rng() * 5).toFixed(3) + "s"; // 0s - 5s
        const duration = (5 + Math.floor(rng() * 5)).toString() + "s"; // 5s - 9s
        return (
          <span
            key={"meteor" + idx}
            className={cn(
              "animate-meteor-effect absolute h-0.5 w-0.5 rotate-[45deg] rounded-[9999px] bg-primary/40 shadow-[0_0_0_1px_#ffffff10] dark:bg-accent/40",
              "before:absolute before:top-1/2 before:h-[1px] before:w-[50px] before:-translate-y-[50%] before:transform before:bg-gradient-to-r before:from-[var(--color-primary)] before:to-transparent before:content-[''] dark:before:from-[var(--color-accent)]",
              className
            )}
            style={{
              top: "-40px",
              left: position + "px",
              animationDelay: delay,
              animationDuration: duration,
            }}
          />
        );
      })}
    </motion.div>
  );
};


