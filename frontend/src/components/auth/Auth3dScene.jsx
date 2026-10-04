import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Auth3dScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.012);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 35, 70);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x020617, 1);
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0x06b6d4, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight.position.set(40, 60, 40);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x10b981, 2, 80);
    pointLight.position.set(0, 15, 0);
    scene.add(pointLight);

    // 4. Metropolitan Ground Grid
    const gridHelper = new THREE.GridHelper(160, 40, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -0.1;
    scene.add(gridHelper);

    // 5. Stylized 3D Cybernetic Building Blocks
    const buildingsGroup = new THREE.Group();
    const buildingGeom = new THREE.BoxGeometry(1, 1, 1);
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85
    });

    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.4
    });

    // Generate random buildings across the perimeter
    const buildingCount = 50;
    for (let i = 0; i < buildingCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 25 + Math.random() * 50;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const w = 4 + Math.random() * 6;
      const d = 4 + Math.random() * 6;
      const h = 8 + Math.random() * 32;

      const mesh = new THREE.Mesh(buildingGeom, buildingMat);
      mesh.scale.set(w, h, d);
      mesh.position.set(x, h / 2, z);
      buildingsGroup.add(mesh);

      // Wireframe edge highlight
      const edges = new THREE.EdgesGeometry(buildingGeom);
      const edgeLine = new THREE.LineSegments(edges, edgeMat);
      edgeLine.scale.set(w, h, d);
      edgeLine.position.set(x, h / 2, z);
      buildingsGroup.add(edgeLine);
    }
    scene.add(buildingsGroup);

    // 6. Holographic Radar Rings
    const ringGeom1 = new THREE.TorusGeometry(18, 0.15, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    const radarRing1 = new THREE.Mesh(ringGeom1, ringMat1);
    radarRing1.rotation.x = Math.PI / 2;
    radarRing1.position.y = 0.5;
    scene.add(radarRing1);

    const ringGeom2 = new THREE.TorusGeometry(32, 0.1, 16, 120);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const radarRing2 = new THREE.Mesh(ringGeom2, ringMat2);
    radarRing2.rotation.x = Math.PI / 2;
    radarRing2.position.y = 0.8;
    scene.add(radarRing2);

    // 7. Dynamic Flowing Traffic Pulses (Vehicles along roads)
    const trafficCount = 180;
    const trafficPositions = new Float32Array(trafficCount * 3);
    const trafficVelocities = [];

    for (let i = 0; i < trafficCount; i++) {
      // Half on North-South axis, half on East-West axis
      const isNS = Math.random() > 0.5;
      const speed = (0.2 + Math.random() * 0.4) * (Math.random() > 0.5 ? 1 : -1);
      
      let x = 0, y = 0.4, z = 0;
      if (isNS) {
        x = (Math.random() - 0.5) * 8; // lane offset
        z = (Math.random() - 0.5) * 140;
      } else {
        x = (Math.random() - 0.5) * 140;
        z = (Math.random() - 0.5) * 8;
      }

      trafficPositions[i * 3] = x;
      trafficPositions[i * 3 + 1] = y;
      trafficPositions[i * 3 + 2] = z;

      trafficVelocities.push({ isNS, speed });
    }

    const trafficGeometry = new THREE.BufferGeometry();
    trafficGeometry.setAttribute('position', new THREE.BufferAttribute(trafficPositions, 3));

    // Particle texture / cyan points
    const trafficMaterial = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 1.8,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    const trafficPoints = new THREE.Points(trafficGeometry, trafficMaterial);
    scene.add(trafficPoints);

    // 8. Mouse Parallax Controls
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouseX = (e.clientX - windowHalfX) * 0.05;
      mouseY = (e.clientY - windowHalfY) * 0.05;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 9. Resize handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera parallax
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      camera.position.x = targetX * 0.8;
      camera.position.y = 35 - targetY * 0.4;
      camera.lookAt(0, 2, 0);

      // Rotate radar rings
      radarRing1.rotation.z += delta * 0.4;
      radarRing2.rotation.z -= delta * 0.2;

      // Pulse central light
      pointLight.intensity = 1.6 + Math.sin(elapsedTime * 3) * 0.6;

      // Update traffic particles position
      const positions = trafficGeometry.attributes.position.array;
      for (let i = 0; i < trafficCount; i++) {
        const vel = trafficVelocities[i];
        if (vel.isNS) {
          positions[i * 3 + 2] += vel.speed;
          if (positions[i * 3 + 2] > 70) positions[i * 3 + 2] = -70;
          if (positions[i * 3 + 2] < -70) positions[i * 3 + 2] = 70;
        } else {
          positions[i * 3] += vel.speed;
          if (positions[i * 3] > 70) positions[i * 3] = -70;
          if (positions[i * 3] < -70) positions[i * 3] = 70;
        }
      }
      trafficGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      buildingGeom.dispose();
      buildingMat.dispose();
      edgeMat.dispose();
      ringGeom1.dispose();
      ringMat1.dispose();
      ringGeom2.dispose();
      ringMat2.dispose();
      trafficGeometry.dispose();
      trafficMaterial.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto"
      style={{ touchAction: 'none' }}
    />
  );
}
