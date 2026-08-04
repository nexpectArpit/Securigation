"use client";

import React, { useEffect, useState } from "react";

export const CyberLaserPath: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(Math.max(window.scrollY / totalHeight, 0), 1);
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // SVG Path definition: Starts around Hero Title, zigzags down through stats and story sections
  const pathD = "M 50 120 C 20 200, 80 250, 50 320 C 10 400, 90 480, 50 550 C 15 650, 85 750, 50 850 C 10 950, 90 1050, 50 1150";

  // Calculate position along path for glowing head bead
  const pathLength = 1600;
  const strokeDashoffset = pathLength * (1 - scrollProgress);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 6 }}>
      <svg
        style={{ width: "100%", height: "100%" }}
        viewBox="0 0 100 1200"
        preserveAspectRatio="none"
      >
        {/* Background Guide Line (Subtle) */}
        <path
          d={pathD}
          fill="none"
          stroke="rgba(0, 245, 200, 0.08)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Scroll-Driven Glowing Neon Laser Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#00f5c8"
          strokeWidth="2.5"
          strokeDasharray={pathLength}
          strokeDashoffset={strokeDashoffset}
          style={{
            filter: "drop-shadow(0 0 8px #00f5c8) drop-shadow(0 0 16px #00f5c8)",
            transition: "stroke-dashoffset 0.1s linear"
          }}
        />
      </svg>
    </div>
  );
};
