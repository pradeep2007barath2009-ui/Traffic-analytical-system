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

    // Vehicles array
    const vehicles = [
      { id: 101, type: 'car', x: 280, y: 120, speed: speedLimit * 0.85, lane: 0, trail: [], stopped: false },
      { id: 102, type: 'truck', x: 420, y: 160, speed: speedLimit * 0.70, lane: 1, trail: [], stopped: false },
      { id: 103, type: 'motorcycle', x: 260, y: 240, speed: speedLimit * 0.95, lane: 0, trail: [], stopped: false },
      { id: 104, type: 'car', x: 460, y: 300, speed: speedLimit * 0.88, lane: 1, trail: [], stopped: false },
      { id: 105, type: 'bus', x: 440, y: 80, speed: speedLimit * 0.65, lane: 1, trail: [], stopped: false }
    ];

    // Pedestrian crossing the zebra crosswalk
    const pedestrian = {
      id: 'P101',
      x: 170,
      y: 255,
      speed: 1.15,
      direction: 1,
      width: 14,
      height: 32
    };

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

        ctx.beginPath();
        ctx.moveTo(380, 60);
        ctx.lineTo(380, height);
        ctx.stroke();

        ctx.setLineDash([]);
      }

      // Stop Line Reference (High-visibility red when yielding)
      const pedCrossingActive = pedestrian.x > 210 && pedestrian.x < 550;
      ctx.strokeStyle = pedCrossingActive ? '#ef4444' : 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = pedCrossingActive ? 4 : 2;
      ctx.beginPath();
      ctx.moveTo(170, 235);
      ctx.lineTo(590, 235);
      ctx.stroke();

      // Zebra Crosswalk Stripes
      ctx.fillStyle = 'rgba(241, 245, 249, 0.9)';
      const zebraY = 245;
      const zebraHeight = 22;
      for (let zx = 185; zx < 580; zx += 32) {
        ctx.fillRect(zx, zebraY, 18, zebraHeight);
      }

      // 4. Update and Draw Pedestrian
      pedestrian.x += pedestrian.speed * pedestrian.direction;
      if (pedestrian.direction === 1 && pedestrian.x > 570) {
        pedestrian.direction = -1;
      } else if (pedestrian.direction === -1 && pedestrian.x < 180) {
        pedestrian.direction = 1;
      }

      const px = pedestrian.x;
      const py = pedestrian.y;

      // Head
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(px, py - 10, 4, 0, Math.PI * 2);
      ctx.fill();

      // Torso & moving legs
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(px - 3, py - 6, 6, 12);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      const legOffset = Math.sin(frame * 0.25) * 4;
      ctx.beginPath();
      ctx.moveTo(px - 2, py + 6);
      ctx.lineTo(px - 2 - legOffset, py + 14);
      ctx.moveTo(px + 2, py + 6);
      ctx.lineTo(px + 2 + legOffset, py + 14);
      ctx.stroke();

      // Pedestrian Computer Vision Bounding Box Overlay
      if (showBoxes) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px - 10, py - 18, 20, 36);

        // Pedestrian Label Tag
        ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
        ctx.fillRect(px - 10, py - 32, 108, 13);
        ctx.fillStyle = '#020617';
        ctx.font = 'bold 8.5px monospace';
        ctx.fillText(`PERSON #${pedestrian.id} 4.8 km/h`, px - 8, py - 22);

        // Crosswalk zone indicator badge
        ctx.fillStyle = '#059669';
        ctx.fillRect(px - 10, py + 20, 72, 12);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 7.5px monospace';
        ctx.fillText('WALK ACTIVE', px - 7, py + 29);
      }

      // 5. Update and Draw Vehicles
      vehicles.forEach((v) => {
        // Vehicle must stop if pedestrian is in the roadway ahead
        const approachingStopLine = v.y > 130 && v.y <= 230;
        const mustStopForPedestrian = pedCrossingActive && approachingStopLine;

        let effectiveSpeed = v.speed;
        if (mustStopForPedestrian) {
          // COMPLETE STOP BEFORE CROSSWALK
          effectiveSpeed = 0;
          v.stopped = true;
          v.y = Math.min(v.y, 224); // Hold strictly before stop line
        } else {
          v.stopped = false;
          const progressFactor = (v.y - 60) / (height - 60);
          const currentSpeedPx = (effectiveSpeed / 60) * (1.5 + progressFactor * 3.5);
          v.y += currentSpeedPx;
        }

        const progressFactor = (v.y - 60) / (height - 60);
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
        if (showTrails && !v.stopped) {
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
          const isYielding = v.stopped;
          const isOverSpeed = !v.stopped && v.speed > speedLimit;
          const boxColor = isYielding ? '#f43f5e' : (isOverSpeed ? '#ef4444' : '#10b981');
          ctx.strokeStyle = boxColor;
          ctx.lineWidth = isYielding ? 2 : 1.5;
          ctx.strokeRect(v.x - vW / 2 - 4, v.y - vH / 2 - 4, vW + 8, vH + 8);

          // Speed & Class Tag
          if (showSpeeds) {
            ctx.fillStyle = isYielding ? 'rgba(244, 63, 94, 0.95)' : 'rgba(15, 23, 42, 0.85)';
            const labelWidth = isYielding ? vW + 48 : vW + 36;
            ctx.fillRect(v.x - vW / 2 - 4, v.y - vH / 2 - 20, labelWidth, 15);

            ctx.fillStyle = isYielding ? '#ffffff' : boxColor;
            ctx.font = 'bold 9px monospace';
            const statusTxt = isYielding ? 'STOP (YIELD)' : `${Math.round(v.speed)} km/h`;
            ctx.fillText(
              `${v.type.toUpperCase()} #${v.id} [${statusTxt}]`,
              v.x - vW / 2 - 2,
              v.y - vH / 2 - 9
            );
          }
        }
      });

      // 6. Scanlines Overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1);
      }

      // 7. Camera Watermark / Timestamp / Telemetry
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = '10px monospace';
      ctx.fillText(`${camId} // SECTOR OPTICAL FEED (LIVE SIMULATION)`, 16, 24);
      ctx.fillText(new Date().toISOString(), 16, 38);

      const statusColor = pedCrossingActive ? '#f43f5e' : '#38bdf8';
      const statusText = pedCrossingActive
        ? 'PEDESTRIAN IN ROADWAY // ALL VEHICLES STOPPED AT ZEBRA'
        : 'TARGETS: 05 VEHICLES | 01 PEDESTRIAN (CROSSWALK CLEAR)';
      ctx.fillStyle = statusColor;
      ctx.fillText(statusText, 16, 52);

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
