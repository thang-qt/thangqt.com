// Custom Cursor Animation (replicated from segundofdez.com)
export function customCursor() {
  let currentX = 0;
  let currentY = 0;
  let aimX = 0;
  let aimY = 0;
  const speed = 0.08;
  const cursor = document.querySelector('.js-cursor');
  
  if (!cursor) return;
  
  const IS_CLICKED = 'is-clicked';
  const IS_HIDDEN = 'is-hidden';
  const IS_HOVER = 'is-hover';
  const IS_INACTIVE = 'is-inactive';
  
  const INACTIVITY_DELAY = 2000; // Hide after 2 seconds of inactivity
  let inactivityTimeout = null;

  function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
  }

  function resetInactivityTimer() {
    // Show cursor immediately
    cursor.classList.remove(IS_INACTIVE);
    
    // Clear existing timeout
    if (inactivityTimeout) {
      clearTimeout(inactivityTimeout);
    }
    
    // Set new timeout to hide cursor
    inactivityTimeout = setTimeout(() => {
      cursor.classList.add(IS_INACTIVE);
    }, INACTIVITY_DELAY);
  }

  function onMouseMove(e) {
    aimX = e.clientX;
    aimY = e.clientY;
    resetInactivityTimer();
  }

  function updateCursorPosition() {
    const diffX = aimX - currentX;
    const diffY = aimY - currentY;

    currentX += diffX * speed;
    currentY += diffY * speed;

    // Use transform for better performance
    cursor.style.transform = `translate(${currentX - 15}px, ${currentY - 15}px)`;

    requestAnimationFrame(updateCursorPosition);
  }

  function addHoverListeners() {
    document.querySelectorAll('a, button').forEach(link => {
      link.addEventListener('mouseover', () => cursor.classList.add(IS_HOVER));
      link.addEventListener('mouseout', () => cursor.classList.remove(IS_HOVER));
    });
  }

  function init() {
    if (isTouchDevice()) {
      cursor.style.display = 'none';
      return;
    }

    // Set initial position to current mouse position
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', () => {
      cursor.classList.add(IS_CLICKED);
      resetInactivityTimer();
    });
    document.addEventListener('mouseup', () => cursor.classList.remove(IS_CLICKED));
    
    document.body.addEventListener('mouseenter', () => {
      cursor.classList.remove(IS_HIDDEN);
      cursor.classList.remove(IS_HOVER);
      resetInactivityTimer();
    });
    
    document.body.addEventListener('mouseleave', () => {
      cursor.classList.add(IS_HIDDEN);
      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
      }
    });

    addHoverListeners();
    updateCursorPosition();
    
    // Start inactivity timer
    resetInactivityTimer();
  }

  init();
}
