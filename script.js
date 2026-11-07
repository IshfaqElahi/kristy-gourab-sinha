/* ==========================================================================
   Kristy Gourab Sinha — Minimal Portfolio Interactions
   ========================================================================== */

(function () {
  'use strict';

  // 1. Theme Toggle (Light / Dark)
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;

  const savedTheme = localStorage.getItem('kgs-theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    root.setAttribute('data-theme', savedTheme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('kgs-theme', next);
    });
  }

  // 2. Minimal Scroll Reveal via IntersectionObserver
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -32px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  // 3. Active Navigation Highlighting on Scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if ('IntersectionObserver' in window && sections.length > 0 && navLinks.length > 0) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const activeId = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              const isMatch = link.getAttribute('href') === `#${activeId}`;
              link.classList.toggle('active', isMatch);
            });
          }
        });
      },
      {
        rootMargin: '-25% 0px -65% 0px',
      }
    );

    sections.forEach((sec) => navObserver.observe(sec));
  }

  // 4. Publications Filter
  const filterButtons = document.querySelectorAll('.filter-btn');
  const pubItems = document.querySelectorAll('.pub-item');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filterValue = btn.getAttribute('data-filter');

      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      pubItems.forEach((item) => {
        const category = item.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  // 5. Toast Helper & Copy Utilities
  const toast = document.getElementById('toast');
  let toastTimeout = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('visible');
    }, 2400);
  }

  // Copy Email Button
  const copyEmailBtns = document.querySelectorAll('[data-copy-email]');
  copyEmailBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = btn.getAttribute('data-copy-email');
      if (navigator.clipboard && email) {
        navigator.clipboard.writeText(email).then(() => {
          showToast(`Copied ${email} to clipboard`);
        });
      }
    });
  });

  // Copy Citation Buttons
  const copyCiteBtns = document.querySelectorAll('[data-citation]');
  copyCiteBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const citation = btn.getAttribute('data-citation');
      if (navigator.clipboard && citation) {
        navigator.clipboard.writeText(citation).then(() => {
          showToast('Citation copied to clipboard');
        });
      }
    });
  });

  // 6. Interactive 3D Crystal Lattice Animation (Three.js)
  function initCrystalAnimation() {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded yet, retrying...');
      setTimeout(initCrystalAnimation, 200);
      return;
    }

    const canvas = document.getElementById('crystal-canvas');
    const stage = document.getElementById('crystal-stage');
    if (!canvas || !stage) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, stage.clientWidth / stage.clientHeight, 0.1, 100);
    camera.position.z = 6.2;

    // High performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(stage.clientWidth, stage.clientHeight);

    // Master Group
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // Primary Faceted Crystal (Icosahedron - 20 Facets)
    const icosaGeometry = new THREE.IcosahedronGeometry(1.85, 0);

    const facetMaterial = new THREE.MeshPhysicalMaterial({
      flatShading: true,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.65,
      ior: 1.52,
      transparent: true,
      opacity: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });

    const crystalMesh = new THREE.Mesh(icosaGeometry, facetMaterial);
    masterGroup.add(crystalMesh);

    // Wireframe Crystallography Lattice Lines
    const wireGeometry = new THREE.WireframeGeometry(icosaGeometry);
    const wireMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.55,
      linewidth: 1
    });
    const wireMesh = new THREE.LineSegments(wireGeometry, wireMaterial);
    masterGroup.add(wireMesh);

    // Vertex Nodes (Atomic Sites in Lattice)
    const nodeGeometry = new THREE.SphereGeometry(0.065, 16, 16);
    const nodeMaterial = new THREE.MeshBasicMaterial();
    const nodeGroup = new THREE.Group();

    const posAttr = icosaGeometry.attributes.position;
    const vertexSet = [];
    for (let i = 0; i < posAttr.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(posAttr, i);
      const exists = vertexSet.some(function(existing) { return existing.distanceTo(v) < 0.05; });
      if (!exists) {
        vertexSet.push(v);
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
        node.position.copy(v);
        nodeGroup.add(node);
      }
    }
    masterGroup.add(nodeGroup);

    // Inner Concentric Unit Cell (Octahedron Core)
    const coreGeometry = new THREE.OctahedronGeometry(0.95, 0);
    const coreMaterial = new THREE.MeshStandardMaterial({
      flatShading: true,
      roughness: 0.3,
      metalness: 0.8,
      transparent: true,
      opacity: 0.68
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    const coreWire = new THREE.LineSegments(
      new THREE.WireframeGeometry(coreGeometry),
      new THREE.LineBasicMaterial({ transparent: true, opacity: 0.7 })
    );
    coreMesh.add(coreWire);
    masterGroup.add(coreMesh);

    // Ambient Quantum Particle Field
    const particleCount = 42;
    const particleGroup = new THREE.Group();
    const particleGeom = new THREE.SphereGeometry(0.028, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial();
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const pMesh = new THREE.Mesh(particleGeom, particleMaterial);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 2.4 + Math.random() * 0.9;
      const speed = 0.4 + Math.random() * 0.8;
      const axis = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();

      pMesh.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );

      particleGroup.add(pMesh);
      particles.push({ mesh: pMesh, radius: radius, theta: theta, speed: speed, axis: axis });
    }
    masterGroup.add(particleGroup);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x5ce1b6, 2.5, 25);
    pointLight1.position.set(3, 4, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x10b981, 1.8, 25);
    pointLight2.position.set(-4, -3, -2);
    scene.add(pointLight2);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.45);
    dirLight.position.set(0, 5, 3);
    scene.add(dirLight);

    // Dynamic Theme Color Synchronization
    function updateColors() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        facetMaterial.color.set(0x0e2b20);
        facetMaterial.emissive.set(0x052a1e);
        facetMaterial.emissiveIntensity = 0.4;
        wireMaterial.color.set(0x5ce1b6);
        wireMaterial.opacity = 0.65;
        nodeMaterial.color.set(0x5ce1b6);
        coreMaterial.color.set(0x164e3c);
        coreMaterial.emissive.set(0x5ce1b6);
        coreMaterial.emissiveIntensity = 0.25;
        coreWire.material.color.set(0x5ce1b6);
        particleMaterial.color.set(0x5ce1b6);
        pointLight1.color.set(0x5ce1b6);
        pointLight2.color.set(0x34d399);
      } else {
        facetMaterial.color.set(0xd5ede3);
        facetMaterial.emissive.set(0x0f4c3a);
        facetMaterial.emissiveIntensity = 0.15;
        wireMaterial.color.set(0x0f4c3a);
        wireMaterial.opacity = 0.4;
        nodeMaterial.color.set(0x0f4c3a);
        coreMaterial.color.set(0x2d6a4f);
        coreMaterial.emissive.set(0x0f4c3a);
        coreMaterial.emissiveIntensity = 0.1;
        coreWire.material.color.set(0x0f4c3a);
        particleMaterial.color.set(0x0f4c3a);
        pointLight1.color.set(0x0f4c3a);
        pointLight2.color.set(0x10b981);
      }
    }
    updateColors();

    const themeObserver = new MutationObserver(updateColors);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    // User Interaction (Drag / Tilt / Pulse)
    let isDragging = false;
    let prevPointer = { x: 0, y: 0 };
    let dragStart = { x: 0, y: 0 };
    const rotVelocity = { x: 0, y: 0 };
    const mouseNorm = { x: 0, y: 0 };

    let pulseScale = 1;
    const targetScale = 1;
    let lightFlash = 0;

    function triggerPulse() {
      pulseScale = 1.25;
      lightFlash = 2.0;
      rotVelocity.y += (Math.random() - 0.5) * 0.08;
      rotVelocity.x += (Math.random() - 0.5) * 0.08;
    }

    stage.addEventListener('pointerdown', function(e) {
      isDragging = true;
      prevPointer = { x: e.clientX, y: e.clientY };
      dragStart = { x: e.clientX, y: e.clientY };
      if (stage.setPointerCapture) stage.setPointerCapture(e.pointerId);
    });

    window.addEventListener('pointermove', function(e) {
      const rect = stage.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / (rect.width || 1);
      const relY = (e.clientY - rect.top) / (rect.height || 1);
      mouseNorm.x = (relX - 0.5) * 2;
      mouseNorm.y = (relY - 0.5) * 2;

      if (isDragging) {
        const dx = e.clientX - prevPointer.x;
        const dy = e.clientY - prevPointer.y;
        rotVelocity.y += dx * 0.005;
        rotVelocity.x += dy * 0.005;
        prevPointer = { x: e.clientX, y: e.clientY };
      }
    });

    function endDrag(e) {
      if (!isDragging) return;
      isDragging = false;
      const dist = Math.hypot(e.clientX - dragStart.x, e.clientY - dragStart.y);
      if (dist < 6) {
        triggerPulse();
      }
    }

    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    // Responsive Canvas Resize
    function onResize() {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();

    // 60FPS Animation Loop
    function animate() {
      requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Inertia & Continuous gentle ambient rotation
      masterGroup.rotation.y += rotVelocity.y + 0.0045;
      masterGroup.rotation.x += rotVelocity.x + 0.002;

      rotVelocity.x *= 0.94;
      rotVelocity.y *= 0.94;

      // Inner Core Counter-Rotation
      coreMesh.rotation.y -= 0.012;
      coreMesh.rotation.z += 0.008;

      // Subtle parallax tilt towards cursor
      const targetTiltX = mouseNorm.y * 0.22;
      const targetTiltY = mouseNorm.x * 0.28;
      masterGroup.position.x += (targetTiltY - masterGroup.position.x) * 0.05;

      // Harmonic floating oscillation
      masterGroup.position.y = Math.sin(elapsed * 1.5) * 0.12 - (targetTiltX * 0.4);

      // Light highlight follower
      pointLight1.position.x = 3 + mouseNorm.x * 2.5;
      pointLight1.position.y = 4 - mouseNorm.y * 2.5;

      // Elastic Spring Pulse on Click
      pulseScale += (targetScale - pulseScale) * 0.08;
      masterGroup.scale.set(pulseScale, pulseScale, pulseScale);

      // Light flash decay
      if (lightFlash > 0) {
        pointLight1.intensity = 2.5 + lightFlash;
        lightFlash *= 0.9;
        if (lightFlash < 0.02) lightFlash = 0;
      }

      // Orbital Particle Swarm
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.mesh.position.applyAxisAngle(p.axis, p.speed * 0.008);
      }

      renderer.render(scene, camera);
    }

    animate();
  }

  // Initialize Crystal Animation
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initCrystalAnimation);
  } else {
    initCrystalAnimation();
  }
})();
