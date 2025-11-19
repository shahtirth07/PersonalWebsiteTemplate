import React, { useEffect, useRef } from 'react';
import './Network3D.css';

const Network3D = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Projection function
    const projectPoint = (point) => {
      const distance = 500;
      const scale = distance / (distance + point.z);
      return {
        x: point.x * scale + canvas.width / 2,
        y: point.y * scale + canvas.height / 2,
        scale: scale,
        z: point.z
      };
    };

    // 3D Node class
    class Node3D {
      constructor() {
        this.x = (Math.random() - 0.5) * 800;
        this.y = (Math.random() - 0.5) * 800;
        this.z = (Math.random() - 0.5) * 800;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.vz = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 3 + 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;

        // Boundary bounce
        if (Math.abs(this.x) > 400) this.vx *= -1;
        if (Math.abs(this.y) > 400) this.vy *= -1;
        if (Math.abs(this.z) > 400) this.vz *= -1;
      }
    }

    // Initialize nodes
    const nodeCount = 50;
    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push(new Node3D());
    }

    // Rotation angles
    let angleX = 0;
    let angleY = 0;
    const rotationSpeed = 0.002;

    // Mouse interaction
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    let targetAngleX = 0;
    let targetAngleY = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      targetAngleY = (mouseX / window.innerWidth - 0.5) * Math.PI * 0.5;
      targetAngleX = (mouseY / window.innerHeight - 0.5) * Math.PI * 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const rotateX = (point, angle) => {
      const y = point.y * Math.cos(angle) - point.z * Math.sin(angle);
      const z = point.y * Math.sin(angle) + point.z * Math.cos(angle);
      return { ...point, y, z };
    };

    const rotateY = (point, angle) => {
      const x = point.x * Math.cos(angle) + point.z * Math.sin(angle);
      const z = -point.x * Math.sin(angle) + point.z * Math.cos(angle);
      return { ...point, x, z };
    };

    const distance = (a, b) => {
      return Math.sqrt(
        Math.pow(a.x - b.x, 2) + 
        Math.pow(a.y - b.y, 2) + 
        Math.pow(a.z - b.z, 2)
      );
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth rotation interpolation
      angleX += (targetAngleX - angleX) * 0.05;
      angleY += (targetAngleY - angleY) * 0.05;

      // Update nodes
      nodes.forEach(node => node.update());

      // Rotate and project nodes
      const rotatedNodes = nodes.map(node => {
        let rotated = { x: node.x, y: node.y, z: node.z };
        rotated = rotateX(rotated, angleX);
        rotated = rotateY(rotated, angleY);
        return rotated;
      });

      // Sort by z-depth for proper rendering
      const sortedIndices = rotatedNodes
        .map((_, i) => i)
        .sort((a, b) => rotatedNodes[b].z - rotatedNodes[a].z);

      // Draw connections
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < rotatedNodes.length; i++) {
        for (let j = i + 1; j < rotatedNodes.length; j++) {
          const dist = distance(rotatedNodes[i], rotatedNodes[j]);
          if (dist < 150) {
            const opacity = (1 - dist / 150) * 0.3;
            ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
            
            const proj1 = projectPoint(rotatedNodes[i]);
            const proj2 = projectPoint(rotatedNodes[j]);
            
            ctx.beginPath();
            ctx.moveTo(proj1.x, proj1.y);
            ctx.lineTo(proj2.x, proj2.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes (back to front)
      sortedIndices.forEach(idx => {
        const rotated = rotatedNodes[idx];
        const node = nodes[idx];
        const proj = projectPoint(rotated);
        
        // Create gradient for each node
        const gradient = ctx.createRadialGradient(
          proj.x, proj.y, 0,
          proj.x, proj.y, proj.scale * node.radius * 2
        );
        
        gradient.addColorStop(0, `rgba(0, 212, 255, ${0.8 * proj.scale})`);
        gradient.addColorStop(0.5, `rgba(0, 245, 255, ${0.4 * proj.scale})`);
        gradient.addColorStop(1, `rgba(0, 212, 255, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.scale * node.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = 15 * proj.scale;
        ctx.shadowColor = 'rgba(0, 212, 255, 0.6)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="network-3d" />;
};

export default Network3D;

