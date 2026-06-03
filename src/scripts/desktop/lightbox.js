export function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox?.querySelector('.lightbox-img');
  const closeButton = lightbox?.querySelector('.lightbox-close');
  const prevButton = lightbox?.querySelector('.lightbox-prev');
  const nextButton = lightbox?.querySelector('.lightbox-next');
  const counter = lightbox?.querySelector('.lightbox-counter');
  if (!lightbox || !lightboxImg) return;

  let images = [];
  let currentIndex = 0;

  function refreshImages() {
    images = Array.from(document.querySelectorAll('.prose img, .post-cover img'));
  }

  function showImage(index) {
    if (images.length === 0) return;
    currentIndex = (index + images.length) % images.length;
    const img = images[currentIndex];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || '';
    counter.textContent = images.length > 1 ? `${currentIndex + 1} / ${images.length}` : '';
  }

  function openImage(index) {
    showImage(index);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeImage() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  refreshImages();
  images.forEach((img, index) => {
    if (img.dataset.lightboxReady === 'true') return;
    img.dataset.lightboxReady = 'true';
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', (event) => {
      event.preventDefault();
      refreshImages();
      openImage(index);
    });
  });

  if (lightbox.dataset.lightboxShellReady === 'true') return;
  lightbox.dataset.lightboxShellReady = 'true';
  closeButton?.addEventListener('click', closeImage);
  prevButton?.addEventListener('click', () => showImage(currentIndex - 1));
  nextButton?.addEventListener('click', () => showImage(currentIndex + 1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeImage();
  });
  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeImage();
    if (event.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (event.key === 'ArrowRight') showImage(currentIndex + 1);
  });
}
