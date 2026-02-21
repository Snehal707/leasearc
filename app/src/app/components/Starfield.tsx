"use client";

import { useEffect, useRef } from "react";

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const stars: Array<{
      x: number;
      y: number;
      radius: number;
      speed: number;
      phase: number;
      twinkleSpeed: number;
    }> = [];

    function resize() {
      if (!canvas || !ctx) return;
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    function initStars() {
      resize();
      stars.length = 0;
      for (let i = 0; i < 350; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.2 + 0.1,
          speed: Math.random() * 0.1 + 0.02,
          phase: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
        });
      }
    }

    let raf: number;

    function animateStars() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, width, height);

      stars.forEach((star) => {
        star.phase += star.twinkleSpeed;
        const opacity = 0.2 + ((Math.sin(star.phase) + 1) / 2) * 0.8;

        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        star.x -= star.speed;
        if (star.x < 0) {
          star.x = width;
          star.y = Math.random() * height;
        }
      });

      raf = requestAnimationFrame(animateStars);
    }

    initStars();
    raf = requestAnimationFrame(animateStars);

    const onResize = () => {
      resize();
      initStars();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="starfield"
      className="absolute inset-0 h-full w-full pointer-events-none z-0 opacity-80"
      aria-hidden
    />
  );
}
