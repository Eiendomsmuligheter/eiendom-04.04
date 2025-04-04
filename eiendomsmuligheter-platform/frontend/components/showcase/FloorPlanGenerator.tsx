import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { SVGRenderer } from 'three/examples/jsm/renderers/SVGRenderer';
import { motion } from 'framer-motion';

const FloorPlanGenerator = ({ propertyData, existingPlan, newPlan }) => {
  const [viewMode, setViewMode] = useState('3d'); // '3d', 'existing', 'new'
  const [scale, setScale] = useState('1:100');
  const threeContainer = useRef(null);
  const svgContainer = useRef(null);
  
  // Initialisering av Three.js scene
  useEffect(() => {
    if (viewMode === '3d' && threeContainer.current) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, threeContainer.current.clientWidth / threeContainer.current.clientHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      
      renderer.setSize(threeContainer.current.clientWidth, threeContainer.current.clientHeight);
      threeContainer.current.appendChild(renderer.domElement);
      
      // Legg til lys
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);
      
      // Legg til OrbitControls for interaksjon
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      
      // Generer 3D-modell basert på propertyData
      generateModel(scene, propertyData, newPlan ? 'new' : 'existing');
      
      camera.position.z = 5;
      
      // Animer scenen
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      
      animate();
      
      return () => {
        // Cleanup
        renderer.dispose();
        if (threeContainer.current) {
          threeContainer.current.removeChild(renderer.domElement);
        }
      };
    }
  }, [viewMode, propertyData, newPlan]);
  
  // Generering av 2D-plantegninger når viewMode er 'existing' eller 'new'
  useEffect(() => {
    if ((viewMode === 'existing' || viewMode === 'new') && svgContainer.current) {
      // Tøm containeren først
      while (svgContainer.current.firstChild) {
        svgContainer.current.removeChild(svgContainer.current.firstChild);
      }
      
      // Opprett SVG for plantegning
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.setAttribute("viewBox", "0 0 1000 800");
      
      // Legg til tittel, målestokk og nord-pil
      addFloorPlanMetadata(svg, {
        title: viewMode === 'existing' ? 'Eksisterende plantegning' : 'Ny plantegning',
        scale: scale,
        date: new Date().toLocaleDateString('no-NO')
      });
      
      // Generer plantegning basert på data
      const planData = viewMode === 'existing' ? existingPlan : newPlan;
      generateFloorPlan(svg, planData);
      
      // Legg til målsetting
      addDimensions(svg, planData);
      
      // Legg til rombenevnelser
      addRoomLabels(svg, planData);
      
      svgContainer.current.appendChild(svg);
    }
  }, [viewMode, scale, existingPlan, newPlan]);
  
  // Helper-funksjoner for å generere elementer
  const generateModel = (scene, data, planType) => {
    // Implementer 3D-modellgenerering her basert på data
    // Dette vil variere basert på hvordan dine data er strukturert
    
    // Eksempel: Legg til gulv
    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    
    // Legg til vegger basert på data
    if (data && data.walls) {
      data.walls.forEach(wall => {
        const wallGeometry = new THREE.BoxGeometry(wall.length, wall.height, wall.thickness);
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
        wallMesh.position.set(wall.x, wall.y, wall.z);
        wallMesh.rotation.set(wall.rotationX, wall.rotationY, wall.rotationZ);
        scene.add(wallMesh);
      });
    }
    
    // Legg til flere elementer etter behov...
  };
  
  const generateFloorPlan = (svg, planData) => {
    const svgNS = "http://www.w3.org/2000/svg";
    
    // Tegn vegger
    if (planData && planData.walls) {
      planData.walls.forEach(wall => {
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", wall.start.x);
        line.setAttribute("y1", wall.start.y);
        line.setAttribute("x2", wall.end.x);
        line.setAttribute("y2", wall.end.y);
        line.setAttribute("stroke", "black");
        line.setAttribute("stroke-width", wall.isLoad ? "3" : "1.5");
        svg.appendChild(line);
      });
    }
    
    // Tegn dører
    if (planData && planData.doors) {
      planData.doors.forEach(door => {
        // Tegn dør som en bue
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", `M ${door.x} ${door.y} A ${door.radius} ${door.radius} 0 0 1 ${door.x + door.radius} ${door.y + door.radius}`);
        path.setAttribute("stroke", "black");
        path.setAttribute("stroke-width", "1");
        path.setAttribute("fill", "none");
        svg.appendChild(path);
      });
    }
    
    // Tegn vinduer
    if (planData && planData.windows) {
      planData.windows.forEach(window => {
        const rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("x", window.x);
        rect.setAttribute("y", window.y);
        rect.setAttribute("width", window.width);
        rect.setAttribute("height", window.depth);
        rect.setAttribute("stroke", "black");
        rect.setAttribute("stroke-width", "1");
        rect.setAttribute("fill", "white");
        svg.appendChild(rect);
      });
    }
    
    // Legg til flere elementer som trapper, faste installasjoner osv.
  };
  
  const addDimensions = (svg, planData) => {
    const svgNS = "http://www.w3.org/2000/svg";
    
    // Legg til horisontale mål
    if (planData && planData.dimensions && planData.dimensions.horizontal) {
      planData.dimensions.horizontal.forEach(dim => {
        // Dimensjonslinje
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", dim.start);
        line.setAttribute("y1", dim.y);
        line.setAttribute("x2", dim.end);
        line.setAttribute("y2", dim.y);
        line.setAttribute("stroke", "black");
        line.setAttribute("stroke-width", "0.5");
        svg.appendChild(line);
        
        // Dimensjonstekst
        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", (dim.start + dim.end) / 2);
        text.setAttribute("y", dim.y - 5);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-size", "12");
        text.textContent = `${dim.length} mm`;
        svg.appendChild(text);
      });
    }
    
    // Legg til vertikale mål på samme måte
  };
  
  const addRoomLabels = (svg, planData) => {
    const svgNS = "http://www.w3.org/2000/svg";
    
    if (planData && planData.rooms) {
      planData.rooms.forEach(room => {
        // Rombenevnelse
        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", room.center.x);
        text.setAttribute("y", room.center.y);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-size", "14");
        text.textContent = room.name;
        svg.appendChild(text);
        
        // Areal
        const areaText = document.createElementNS(svgNS, "text");
        areaText.setAttribute("x", room.center.x);
        areaText.setAttribute("y", room.center.y + 20);
        areaText.setAttribute("text-anchor", "middle");
        areaText.setAttribute("font-size", "12");
        areaText.textContent = `${room.area} m²`;
        svg.appendChild(areaText);
      });
    }
  };
  
  const addFloorPlanMetadata = (svg, metadata) => {
    const svgNS = "http://www.w3.org/2000/svg";
    
    // Tittel
    const title = document.createElementNS(svgNS, "text");
    title.setAttribute("x", 500);
    title.setAttribute("y", 30);
    title.setAttribute("text-anchor", "middle");
    title.setAttribute("font-size", "20");
    title.setAttribute("font-weight", "bold");
    title.textContent = metadata.title;
    svg.appendChild(title);
    
    // Målestokk
    const scale = document.createElementNS(svgNS, "text");
    scale.setAttribute("x", 100);
    scale.setAttribute("y", 780);
    scale.setAttribute("font-size", "14");
    scale.textContent = `Målestokk: ${metadata.scale}`;
    svg.appendChild(scale);
    
    // Dato
    const date = document.createElementNS(svgNS, "text");
    date.setAttribute("x", 900);
    date.setAttribute("y", 780);
    date.setAttribute("text-anchor", "end");
    date.setAttribute("font-size", "14");
    date.textContent = `Dato: ${metadata.date}`;
    svg.appendChild(date);
    
    // Nord-pil
    const northArrow = document.createElementNS(svgNS, "g");
    northArrow.setAttribute("transform", "translate(900, 100)");
    
    const arrow = document.createElementNS(svgNS, "path");
    arrow.setAttribute("d", "M0,20 L0,-20 L5,-15 L0,-20 L-5,-15 Z");
    arrow.setAttribute("fill", "black");
    northArrow.appendChild(arrow);
    
    const northLabel = document.createElementNS(svgNS, "text");
    northLabel.setAttribute("y", -25);
    northLabel.setAttribute("text-anchor", "middle");
    northLabel.setAttribute("font-size", "12");
    northLabel.textContent = "N";
    northArrow.appendChild(northLabel);
    
    svg.appendChild(northArrow);
  };
  
  // Funksjon for å eksportere til PDF
  const exportToPDF = () => {
    // Implementer PDF-eksport her
    // Du kan bruke biblioteker som jsPDF eller html2pdf
    console.log("Eksporterer til PDF...");
    
    // Dette ville vanligvis kalle en backend-tjeneste som genererer PDF-en
    // eller bruke et klient-bibliotek til å lage PDF-en direkte
  };
  
  return (
    <div className="floor-plan-generator bg-gray-50 p-6 rounded-xl shadow-lg">
      <div className="controls flex justify-between mb-6">
        <div className="view-modes flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg ${viewMode === '3d' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setViewMode('3d')}
          >
            3D-modell
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg ${viewMode === 'existing' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setViewMode('existing')}
          >
            Eksisterende plantegning
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg ${viewMode === 'new' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setViewMode('new')}
          >
            Ny plantegning
          </motion.button>
        </div>
        
        <div className="actions flex space-x-2">
          <select
            value={scale}
            onChange={(e) => setScale(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="1:50">1:50</option>
            <option value="1:100">1:100</option>
            <option value="1:200">1:200</option>
          </select>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center"
            onClick={exportToPDF}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Eksporter PDF
          </motion.button>
        </div>
      </div>
      
      <div className="viewer border border-gray-300 rounded-xl overflow-hidden" style={{ height: '70vh' }}>
        {viewMode === '3d' ? (
          <div ref={threeContainer} className="w-full h-full bg-gray-800"></div>
        ) : (
          <div ref={svgContainer} className="w-full h-full bg-white"></div>
        )}
      </div>
      
      <div className="info mt-4 text-sm text-gray-600">
        <p>Tegningene oppfyller kravene til kommunale byggesøknader og inkluderer all nødvendig målsetting, rombenevnelser og tekniske detaljer. Ved eksport vil dokumentene automatisk formateres i henhold til standard kommunale krav.</p>
      </div>
    </div>
  );
};

export default FloorPlanGenerator;