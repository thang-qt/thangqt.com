import { gsap } from 'gsap';

/**
 * Custom cursor animation using GSAP
 * Creates a smooth following cursor with hover effects
 */

export function initCursor() {
  // Check if device supports hover (skip for touch devices)
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    return;
  }

  // Create cursor element
  const cursor = document.createElement('div');
  cursor.classList.add('cursor');
  document.body.appendChild(cursor);

  const cursorSize = 40;
  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;

  // Track mouse movement
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (!cursor.classList.contains('active')) {
      cursor.classList.add('active');
    }
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    cursor.classList.remove('active');
  });

  // GSAP animation loop for smooth following
  gsap.ticker.add(() => {
    // Smooth easing
    const speed = 0.15;
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;

    // Update cursor position
    gsap.set(cursor, {
      x: cursorX - cursorSize / 2,
      y: cursorY - cursorSize / 2,
    });
  });

  // Hover effects on interactive elements
  const interactiveElements = 'a, button, [role="button"], input, textarea, select';
  
  const addHoverEffect = (e) => {
    cursor.classList.add('hover');
  };

  const removeHoverEffect = (e) => {
    cursor.classList.remove('hover');
  };

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveElements)) {
      addHoverEffect(e);
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveElements)) {
      removeHoverEffect(e);
    }
  });

  // Scale down on click
  document.addEventListener('mousedown', () => {
    gsap.to(cursor, {
      scale: 0.8,
      duration: 0.2,
      ease: 'power2.out'
    });
  });

  document.addEventListener('mouseup', () => {
    gsap.to(cursor, {
      scale: 1,
      duration: 0.2,
      ease: 'power2.out'
    });
  });
}
