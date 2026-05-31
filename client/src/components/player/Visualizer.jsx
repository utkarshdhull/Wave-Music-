import { useEffect, useRef } from "react";

export function Visualizer({ analyser, mode, dynamicColor }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId;
    
    // Set canvas dimensions with high-DPI scaling
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const bufferLength = analyser ? analyser.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationId = requestAnimationFrame(draw);

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, width, height);

      // Safe fallback for color theme
      const color = dynamicColor || { r: 29, g: 185, b: 84 };
      const colorString = `rgb(${color.r}, ${color.g}, ${color.b})`;

      // Set up neon glow styles
      ctx.shadowBlur = 12;
      ctx.shadowColor = colorString;

      if (!analyser) {
        // Subtle flat line fallback when not playing/no analyzer connected
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.25)`;
        ctx.shadowBlur = 0;
        
        if (mode === "circle") {
          ctx.beginPath();
          ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.28, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, height / 2);
          ctx.lineTo(width, height / 2);
          ctx.stroke();
        }
        return;
      }

      if (mode === "waveform") {
        analyser.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 3;
        ctx.strokeStyle = colorString;
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
      } else if (mode === "bar") {
        analyser.getByteFrequencyData(dataArray);

        ctx.shadowBlur = 10;
        const barWidth = (width / bufferLength) * 1.5;
        let x = 0;

        // Draw symmetrical center-mirrored spectrum bars
        for (let i = 0; i < bufferLength; i++) {
          const percent = dataArray[i] / 255;
          const barHeight = percent * (height * 0.7);

          // Draw top and bottom glowing lines or centered blocks
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.15 + percent * 0.85})`;
          
          const y = height - barHeight;
          ctx.fillRect(x, y, barWidth - 1, barHeight);

          x += barWidth + 1;
        }
      } else if (mode === "circle") {
        analyser.getByteFrequencyData(dataArray);

        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = Math.min(width, height) * 0.28;

        ctx.lineWidth = 3;
        ctx.strokeStyle = colorString;

        // Draw dynamic pulsing core circle
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const avg = sum / bufferLength;
        const pulse = (avg / 255) * 12;

        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius + pulse, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.25)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = colorString;

        for (let i = 0; i < bufferLength; i++) {
          const percent = dataArray[i] / 255;
          const barHeight = percent * 60; // outward extension

          const angle = (i / bufferLength) * Math.PI * 2;
          
          const startR = baseRadius + pulse;
          const endR = startR + barHeight;

          const x1 = centerX + Math.cos(angle) * startR;
          const y1 = centerY + Math.sin(angle) * startR;
          const x2 = centerX + Math.cos(angle) * endR;
          const y2 = centerY + Math.sin(angle) * endR;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [analyser, mode, dynamicColor]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}
