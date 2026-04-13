'use strict';

/* ══════════════════════════════════════════════════
   1. THREE.JS 3D BACKGROUND (Floating Logo/Shape)
══════════════════════════════════════════════════ */
function initThreeJS() {
  const container = document.getElementById('canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  // Scene setup
  const scene = new THREE.Scene();
  
  // Camera setup
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Group for the floating elements
  const logoGroup = new THREE.Group();
  scene.add(logoGroup);

  // Material (Obsidian / slightly metallic with Electric Blue reflections)
  const material = new THREE.MeshStandardMaterial({
    color: 0x1E1E1E,
    roughness: 0.2,
    metalness: 0.8,
  });

  // Create abstract geometric shapes representing "PK" or tech
  const geometry1 = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const cube1 = new THREE.Mesh(geometry1, material);
  cube1.position.set(-0.8, 0, 0);
  cube1.rotation.set(Math.PI / 4, Math.PI / 4, 0);
  logoGroup.add(cube1);

  const geometry2 = new THREE.TorusGeometry(1.2, 0.3, 16, 100);
  const torus = new THREE.Mesh(geometry2, material);
  torus.position.set(0.8, -0.5, -0.5);
  torus.rotation.set(Math.PI / 3, 0, 0);
  logoGroup.add(torus);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x222222); // subtle ambient
  scene.add(ambientLight);

  // Single "Sun" point light (Warm/Gold as requested)
  const pointLight = new THREE.PointLight(0xFFD700, 1.5, 100);
  pointLight.position.set(2, 3, 4);
  scene.add(pointLight);
  
  // Fill light (Electric Blue accent)
  const fillLight = new THREE.PointLight(0x00E5FF, 1, 100);
  fillLight.position.set(-3, -2, -2);
  scene.add(fillLight);

  // Particles Array (Stars/Dust)
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 800; // number of dots
  const posArray = new Float32Array(particlesCount * 3);
  for(let i = 0; i < particlesCount * 3; i++) {
    // Spread them across a wide area so scrolling reveals them
    posArray[i] = (Math.random() - 0.5) * 20;
  }
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0x00E5FF, // Electric blue dots
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });
  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);

  // Position logo in upper-middle
  logoGroup.position.set(0, 0.5, 0);

  // Parallax logic variables
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  let scrollY = 0;

  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX) * 0.001;
    mouseY = (event.clientY - windowHalfY) * 0.001;
  });
  
  // Track window scroll to make elements move slightly up as you scroll down
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY * 0.002;
  });

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Constant slow rotation for main logo
    logoGroup.rotation.y = time * 0.2;
    logoGroup.rotation.x = Math.sin(time * 0.5) * 0.1;
    
    // Slowly rotate particle field
    particlesMesh.rotation.y = time * 0.05;

    // Floating effect
    logoGroup.position.y = 0.5 + Math.sin(time) * 0.1 - scrollY;

    // Mouse Parallax effect
    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;
    
    // Smooth interpolation
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (-targetY - camera.position.y) * 0.02;
    
    // Keep camera looking at center-ish
    camera.lookAt(0, -scrollY * 0.5, 0);

    renderer.render(scene, camera);
  }

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Fallback logic for mobile (could reduce scale)
    if (window.innerWidth < 768) {
      logoGroup.scale.set(0.7, 0.7, 0.7);
    } else {
      logoGroup.scale.set(1, 1, 1);
    }
  });

  // Initial mobile check
  if (window.innerWidth < 768) {
    logoGroup.scale.set(0.7, 0.7, 0.7);
  }
}

// Initialize Three.js when DOM is ready
window.addEventListener('DOMContentLoaded', initThreeJS);

/* ══════════════════════════════════════════════════
   2. TYPING ANIMATION
══════════════════════════════════════════════════ */
const words = ['JAVA SPECIALIST', 'FRONTEND DEV', 'WEB ENTHUSIAST'];
const typingEl = document.getElementById('typing-text');
if (typingEl) {
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const TYPING_SPEED = 100;
  const DELETE_SPEED = 50;
  const PAUSE_END = 2000;
  const PAUSE_START = 500;

  function typeLoop() {
    const word = words[wordIndex];
    const displayed = isDeleting
      ? word.slice(0, charIndex--)
      : word.slice(0, ++charIndex);

    typingEl.textContent = displayed;

    let delay = isDeleting ? DELETE_SPEED : TYPING_SPEED;

    if (!isDeleting && charIndex === word.length) {
      delay = PAUSE_END;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = PAUSE_START;
    }

    setTimeout(typeLoop, delay);
  }

  setTimeout(typeLoop, 800);
}

/* ══════════════════════════════════════════════════
   3. SCROLL REVEAL (Framer-motion style CSS)
══════════════════════════════════════════════════ */
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

/* ══════════════════════════════════════════════════
   4. NAVBAR SCROLL & MENU
══════════════════════════════════════════════════ */
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }

  let current = '';
  sections.forEach(sec => {
    const offset = sec.offsetTop - 150;
    if (window.scrollY >= offset) current = sec.getAttribute('id');
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}, { passive: true });

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
  });

  document.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });
}

// Fallback year for footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ══════════════════════════════════════════════════
   5. CURSOR GLOW (Soft Radial Background Effect)
══════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════
   5. CUSTOM CURSOR & GLOW EFFECT
══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Hide default cursor
  document.body.style.cursor = 'none';

  const cursorGlow = document.createElement('div');
  cursorGlow.classList.add('cursor-glow');
  
  const cursorDot = document.createElement('div');
  cursorDot.classList.add('cursor-dot');
  
  const cursorRing = document.createElement('div');
  cursorRing.classList.add('cursor-ring');
  
  document.body.appendChild(cursorGlow);
  document.body.appendChild(cursorDot);
  document.body.appendChild(cursorRing);

  // Position tracking
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  
  // Physics targets
  let ringX = mouseX;
  let ringY = mouseY;
  let glowX = mouseX;
  let glowY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Dot moves instantly
    cursorDot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
  });

  // Smooth follow for Ring and Glow
  function smoothCursor() {
    // Ring follows quickly but smoothly
    ringX += (mouseX - ringX) * 0.2;
    ringY += (mouseY - ringY) * 0.2;
    cursorRing.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
    
    // Glow follows lazily
    glowX += (mouseX - glowX) * 0.1;
    glowY += (mouseY - glowY) * 0.1;
    cursorGlow.style.transform = `translate(calc(${glowX}px - 50%), calc(${glowY}px - 50%))`;
    
    requestAnimationFrame(smoothCursor);
  }
  smoothCursor();

  // Hover states for links and buttons to expand ring
  const interactables = document.querySelectorAll('a, button, .project-card, .expertise-card');
  interactables.forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovered'));
    
    // Safety fallback - use default cursor forcefully on these if they don't hide it
    el.style.cursor = 'none'; 
  });
});
