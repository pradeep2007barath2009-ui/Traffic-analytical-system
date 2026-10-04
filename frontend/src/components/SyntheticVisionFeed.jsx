import React, { useEffect, useRef } from 'react';

export default function SyntheticVisionFeed({
  camera,
  showBoxes = true,
  showSpeeds = true,
  showTrails = true,
  showLanes = true,
  className = "w-full h-auto aspect-video rounded-xl"
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = 760;
    const height = 440;
    canvas.width = width;
    canvas.height = height;

    const speedLimit = camera?.limit || 60;
    const camId = camera?.id || 'CAM-01';

    // Vehicles array for this camera
    const vehicleTypes = ['car', 'motorcycle', 'truck', 'bus'];
    const vehicles = [
      { id: 101, type: 'car', x: 280, y: 120, speed: speedLimit * 0.85, lane: 0, trail: [] },
      { id: 102, type: 'truck', x: 420, y: 160, speed: speedLimit * 0.70, lane: 1, trail: [] },
      { id: 103, type: 'motorcycle', x: 260, y: 240, speed: speedLimit * 0.95, lane: 0, trail: [] },
      { id: 104, type: 'car', x: 460, y: 300, speed: speedLimit * 0.88, lane: 1, trail: [] },
      { id: 105, type: 'bus', x: 440, y: 80, speed: speedLimit * 0.65, lane: 1, trail: [] }
    ];

    let animId;
    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // 1. Background Asphalt
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(0, 0, width, height);

      // 2. Highway Road Perspective Polygon
      const roadTopLeft = 240;
      const roadTopRight = 520;
      const roadBottomLeft = 80;
      const roadBottomRight = 680;

      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.moveTo(roadTopLeft, 60);
      ctx.lineTo(roadTopRight, 60);
      ctx.lineTo(roadBottomRight, height);
      ctx.lineTo(roadBottomLeft, height);
      ctx.closePath();
      ctx.fill();

      // Road Borders (Curbs)
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(roadTopLeft, 60);
      ctx.lineTo(roadBottomLeft, height);
      ctx.moveTo(roadTopRight, 60);
      ctx.lineTo(roadBottomRight, height);
      ctx.stroke();

      // 3. Lane Dividers
      if (showLanes) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([12, 16]);
        ctx.lineDashOffset = -frame * 3;

        // Center line
        ctx.beginPath();
        ctx.moveTo(380, 60);
        ctx.lineTo(380, height);
        ctx.stroke();

        ctx.setLineDash([]);
      }

      // Stop Line Reference
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(160, 255);
      ctx.lineTo(600, 255);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4. Update and Draw Vehicles
      vehicles.forEach((v) => {
        // Advance vehicle forward (downward perspective)
        const progressFactor = (v.y - 60) / (height - 60);
        const currentSpeedPx = (v.speed / 60) * (1.5 + progressFactor * 3.5);
        v.y += currentSpeedPx;

        // Scale based on perspective distance
        const scale = 0.5 + progressFactor * 0.9;
        const vW = (v.type === 'truck' || v.type === 'bus' ? 44 : v.type === 'motorcycle' ? 22 : 36) * scale;
        const vH = (v.type === 'truck' ? 68 : v.type === 'bus' ? 60 : v.type === 'motorcycle' ? 32 : 48) * scale;

        // Reset if reached bottom
        if (v.y > height + 40) {
          v.y = 70;
          v.trail = [];
          v.speed = speedLimit * (0.75 + Math.random() * 0.35);
        }

        // Keep trail
        if (showTrails) {
          v.trail.push({ x: v.x, y: v.y });
          if (v.trail.length > 12) v.trail.shift();

          ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          v.trail.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.stroke();
        }

        // Draw Vehicle Body
        ctx.fillStyle = v.type === 'truck' ? '#8b5cf6' : v.type === 'bus' ? '#f59e0b' : v.type === 'motorcycle' ? '#10b981' : '#0284c7';
        ctx.beginPath();
        ctx.roundRect(v.x - vW / 2, v.y - vH / 2, vW, vH, 4);
        ctx.fill();

        // Windshield
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(v.x - (vW - 6) / 2, v.y - vH / 2 + 4, vW - 6, vH * 0.25);

        // Headlights
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(v.x - vW / 2 + 2, v.y + vH / 2 - 4, 3 * scale, 3 * scale);
        ctx.fillRect(v.x + vW / 2 - 5, v.y + vH / 2 - 4, 3 * scale, 3 * scale);

        // Draw Computer Vision Bounding Box Overlay
        if (showBoxes) {
          const isOverSpeed = v.speed > speedLimit;
          const boxColor = isOverSpeed ? '#ef4444' : '#06b6d4';
          ctx.strokeStyle = boxColor;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(v.x - vW / 2 - 4, v.y - vH / 2 - 4, vW + 8, vH + 8);

          // Corner bracket accents
          ctx.fillStyle = boxColor;
          const bSize = 4;
          ctx.fillRect(v.x - vW / 2 - 4, v.y - vH / 2 - 4, bSize, 2);
          ctx.fillRect(v.x - vW / 2 - 4, v.y - vH / 2 - 4, 2, bSize);
          ctx.fillRect(v.x + vW / 2 + 4 - bSize, v.y - vH / 2 - 4, bSize, 2);
          ctx.fillRect(v.x + vW / 2 + 2, v.y - vH / 2 - 4, 2, bSize);

          // Speed & Class Tag
          if (showSpeeds) {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.fillRect(v.x - vW / 2 - 4, v.y - vH / 2 - 20, vW + 28, 14);

            ctx.fillStyle = boxColor;
            ctx.font = 'bold 9px monospace';
            ctx.fillText(
              `${v.type.toUpperCase()} #${v.id} ${Math.round(v.speed)} km/h`,
              v.x - vW / 2 - 2,
              v.y - vH / 2 - 9
            );
          }
        }
      });

      // 5. Scanlines Overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1);
      }

      // 6. Camera Watermark / Timestamp
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '10px monospace';
      ctx.fillText(`${camId} // SECTOR OPTICAL FEED (LIVE SIMULATION)`, 16, 24);
      ctx.fillText(new Date().toISOString(), 16, 40);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [camera, showBoxes, showSpeeds, showTrails, showLanes]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', background: '#020617' }}
    />
  );
}
