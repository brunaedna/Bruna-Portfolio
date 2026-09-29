const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
const sections = [...document.querySelectorAll('main section[id]')];
const scrollProgress = document.querySelector('[data-scroll-progress]');
const scrollScenes = [...document.querySelectorAll('[data-scroll-scene]')];
const scrollItems = [...document.querySelectorAll('[data-scroll-item]')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document.querySelector('[data-year]').textContent = new Date().getFullYear();

function closeMenu() {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('open', !open);
});

navLinks.forEach((link) => link.addEventListener('click', closeMenu));

document.querySelectorAll('.skills span').forEach((skill, index) => {
  skill.style.setProperty('--stagger', index);
});

document.querySelectorAll('.project-card').forEach((card, index) => {
  card.style.setProperty('--card-index', index);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55% 0px' });

sections.forEach((section) => sectionObserver.observe(section));

let scrollFrame = null;

function clamp(value, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function updateScrollEffects() {
  scrollFrame = null;
  const viewportHeight = window.innerHeight;
  const scrollableHeight = document.documentElement.scrollHeight - viewportHeight;
  const pageProgress = scrollableHeight > 0 ? clamp(window.scrollY / scrollableHeight) : 0;

  header.classList.toggle('scrolled', window.scrollY > 24);
  scrollProgress.style.transform = `scaleX(${pageProgress})`;
  document.documentElement.style.setProperty('--page-progress', pageProgress.toFixed(4));
  document.documentElement.style.setProperty('--ambient-one-y', `${(pageProgress * 38).toFixed(2)}vh`);
  document.documentElement.style.setProperty('--ambient-two-y', `${(pageProgress * -28).toFixed(2)}vh`);

  if (reducedMotion.matches) return;

  scrollScenes.forEach((scene) => {
    const rect = scene.getBoundingClientRect();
    const progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height));
    scene.style.setProperty('--scene-progress', progress.toFixed(4));
    scene.style.setProperty('--scene-shift', `${((progress - 0.5) * 2).toFixed(4)}`);
    scene.style.setProperty('--scene-image-y', `${(progress * 46).toFixed(2)}px`);
    scene.style.setProperty('--scene-content-y', `${(progress * -48).toFixed(2)}px`);
    scene.style.setProperty('--scene-note-x', `${(progress * -22).toFixed(2)}px`);
    scene.style.setProperty('--scene-note-y', `${(progress * -18).toFixed(2)}px`);
    scene.style.setProperty('--hero-opacity', Math.max(0.52, 1 - progress * 0.48).toFixed(4));
  });

  scrollItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const centerDistance = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
    const shift = clamp(centerDistance, -1, 1);
    item.style.setProperty('--item-shift', shift.toFixed(4));
    item.style.setProperty('--item-y', `${(shift * -9).toFixed(2)}px`);
    item.style.setProperty('--item-hover-y', `${(shift * -9 - 6).toFixed(2)}px`);
    item.style.setProperty('--item-x', `${(shift * 25).toFixed(2)}px`);
    item.style.setProperty('--item-watermark-y', `${(shift * -34).toFixed(2)}px`);
  });
}

function requestScrollUpdate() {
  if (scrollFrame === null) scrollFrame = requestAnimationFrame(updateScrollEffects);
}

window.addEventListener('scroll', requestScrollUpdate, { passive: true });
window.addEventListener('resize', requestScrollUpdate, { passive: true });
reducedMotion.addEventListener?.('change', requestScrollUpdate);
requestScrollUpdate();

if (!reducedMotion.matches) {
  const heroImage = document.querySelector('.hero-art img');
  document.querySelector('.hero').addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 10;
    const y = (event.clientY / window.innerHeight - 0.5) * 8;
    heroImage.style.setProperty('--pointer-x', `${x}px`);
    heroImage.style.setProperty('--pointer-y', `${y}px`);
  });

  document.querySelector('.hero').addEventListener('pointerleave', () => {
    heroImage.style.setProperty('--pointer-x', '0px');
    heroImage.style.setProperty('--pointer-y', '0px');
  });
}
