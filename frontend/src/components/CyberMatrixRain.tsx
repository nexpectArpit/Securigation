"use client";

import React, { useEffect, useRef } from "react";

export const CyberMatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const binaryPatterns = [
      "1101010", "1100110", "1101000", "1110011", "1101010",
      "1100100", "1100110", "1110011", "1101000", "1101010",
      "1101000", "1101010", "1101000", "1110011", "1100110"
    ];

    const fontSize = 15;
    const colWidth = 65;

    // Track column states dynamically
    let columnOffsets: number[] = [];
    let columnSpeeds: number[] = [];
    let columnSeeds: string[][] = [];

    const initColumns = (w: number) => {
      const colCount = Math.ceil(w / colWidth) + 10;
      columnOffsets = [];
      columnSpeeds = [];
      columnSeeds = [];

      for (let i = 0; i < colCount; i++) {
        columnOffsets[i] = Math.random() * -1000;
        columnSpeeds[i] = 0.25 + Math.random() * 0.15;

        const colData: string[] = [];
        for (let j = 0; j < 75; j++) {
          colData.push(binaryPatterns[Math.floor(Math.random() * binaryPatterns.length)]);
        }
        columnSeeds[i] = colData;
      }
    };

    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        initColumns(width);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    const draw = () => {
      updateSize();

      ctx.fillStyle = "#040912";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `600 ${fontSize}px 'JetBrains Mono', monospace`;

      const totalRows = 75;
      const rowHeight = 22;
      const currentCols = Math.ceil(canvas.width / colWidth) + 2;

      for (let i = 0; i < currentCols; i++) {
        const x = i * colWidth;

        if (columnOffsets[i] === undefined) {
          columnOffsets[i] = Math.random() * -1000;
          columnSpeeds[i] = 0.25 + Math.random() * 0.15;
          const colData: string[] = [];
          for (let j = 0; j < 75; j++) {
            colData.push(binaryPatterns[Math.floor(Math.random() * binaryPatterns.length)]);
          }
          columnSeeds[i] = colData;
        }

        columnOffsets[i] += columnSpeeds[i];

        if (columnOffsets[i] > totalRows * rowHeight) {
          columnOffsets[i] = 0;
        }

        const colData = columnSeeds[i] || [];

        for (let j = 0; j < totalRows; j++) {
          const y = (j * rowHeight + columnOffsets[i]) % (totalRows * rowHeight) - rowHeight;
          const text = colData[j % colData.length] || "1101010";

          const baseOpacity = 0.32;

          if (j % 9 === 0) {
            ctx.fillStyle = `rgba(0, 245, 200, ${baseOpacity * 1.3})`;
            ctx.shadowBlur = 4;
            ctx.shadowColor = "rgba(0, 245, 200, 0.4)";
          } else if (j % 4 === 0) {
            ctx.fillStyle = `rgba(6, 182, 212, ${baseOpacity * 0.9})`;
            ctx.shadowBlur = 2;
            ctx.shadowColor = "rgba(6, 182, 212, 0.2)";
          } else {
            ctx.fillStyle = `rgba(0, 140, 150, ${baseOpacity * 0.55})`;
            ctx.shadowBlur = 0;
          }

          ctx.fillText(text, x, y);
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", updateSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.65
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block"
        }}
      />
    </div>
  );
};
