import React, { useEffect, useState, useRef } from 'react';
import styles from '@/styles/Home.module.css';

interface Color {
  h: number;
  s: number;
  l: number;
  a: number;
  dir: number;
  toString: () => string;
}

interface Coordinate {
  c: number;
  min: number;
  max: number;
  dir: number;
}

interface Pixel {
  x: Coordinate;
  y: Coordinate;
  w: Coordinate;
  h: Coordinate;
  color: Color;
  direction: number;
  velocity: number;
}

const createColor = (h: number, s: number, l: number, a: number): Color => {
  const color: Color = {
    h,
    s,
    l,
    a,
    dir: Math.random() > 0.5 ? -1 : 1,
    toString: function () {
      return `hsla(${this.h}, ${this.s}%, ${this.l}%, ${this.a})`;
    },
  };
  return color;
};

const createPixel = (
  x: number,
  y: number,
  w: number,
  h: number,
  color: Color,
  canvasRef: React.RefObject<HTMLCanvasElement>
): Pixel => {
  const pixel: Pixel = {
    x: {
      c: x,
      min: 0,
      max: canvasRef.current ? canvasRef.current.width : 0,
      dir: Math.random() > 0.5 ? -1 : 1,
    },
    y: {
      c: y,
      min: 0,
      max: canvasRef.current ? canvasRef.current.height : 0,
      dir: Math.random() > 0.5 ? -1 : 1,
    },
    w: {
      c: w,
      min: 2,
      max: canvasRef.current ? canvasRef.current.width : 0,
      dir: Math.random() > 0.5 ? -1 : 1,
    },
    h: {
      c: h,
      min: 2,
      max: canvasRef.current ? canvasRef.current.height : 0,
      dir: Math.random() > 0.5 ? -1 : 1,
    },
    color,
    direction: Math.random() > 0.1 ? -1 : 1,
    velocity: (Math.random() * 100 + 100) * 0.01 * (Math.random() > 0.5 ? -1 : 1),
  };
  return pixel;
};

const GradientBG: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [pixels, setPixels] = useState<Pixel[]>([]);

  const updatePixel = (pixel: Pixel) => {
    if (pixel.x.c <= pixel.x.min || pixel.x.c >= pixel.x.max) {
      pixel.x.dir *= -1;
    }

    if (pixel.y.c <= pixel.y.min || pixel.y.c >= pixel.y.max) {
      pixel.y.dir *= -1;
    }

    if (pixel.w.c <= pixel.w.min || pixel.w.c >= pixel.w.max) {
      pixel.w.dir *= -1;
    }

    if (pixel.h.c <= pixel.h.min || pixel.h.c >= pixel.h.max) {
      pixel.h.dir *= -1;
    }

    if (pixel.color.a <= 0 || pixel.color.a >= 0.75) {
      pixel.color.dir *= -1;
    }

    pixel.x.c += 0.005 * pixel.x.dir;
    pixel.y.c += 0.005 * pixel.y.dir;
    pixel.w.c += 0.005 * pixel.w.dir;
    pixel.h.c += 0.005 * pixel.h.dir;
  };

  const renderPixel = (pixel: Pixel) => {
    if (context) {
      context.restore();
      context.fillStyle = pixel.color.toString();
      context.fillRect(pixel.x.c, pixel.y.c, pixel.w.c, pixel.h.c);
    }
  };

  const paint = () => {
    if (canvasRef.current && context) {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      pixels.forEach((pixel) => {
        updatePixel(pixel);
        renderPixel(pixel);
      });
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        setContext(ctx);

        const currentPixels = [
          createPixel(1, 1, 3, 4, createColor(0, 0, 0, 1), canvasRef), // Azul claro
          createPixel(0, 0, 1, 1, createColor(0, 0, 0, 1), canvasRef), // Negro
          createPixel(0, 3, 2, 2, createColor(120, 100, 50, 0.8), canvasRef), // Verde
          createPixel(4, 0, 4, 3, createColor(0, 0, 0, 1), canvasRef), // Azul
          createPixel(3, 1, 1, 2, createColor(0, 0, 50, 0.8), canvasRef), // Gris
        ];
        setPixels(currentPixels);
      }
    }
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    if (context) {
      const animate = () => {
        paint();
        animationFrameId = window.requestAnimationFrame(animate);
      };

      animate();
    }

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [context, pixels]);

  return (
    <>
      <div className={styles.background}>
        <canvas className={styles.backgroundGradients} width="6" height="6" ref={canvasRef} />
      </div>
      <div className={styles.container}>{children}</div>
    </>
  );
};

export default GradientBG;