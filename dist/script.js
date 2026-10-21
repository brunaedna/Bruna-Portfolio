'use strict';
const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const navLinks = [...nav.querySelectorAll('a')];
const sections = [...document.querySelectorAll('main section[id]')];
const cards = [...document.querySelectorAll('.project-card')];
const hero = document.querySelector('.hero');
const about = document.querySelector('.about');
const marquee = document.querySelector('[data-marquee]');
const projectCount = document.querySelector('[data-project-count]');
const progressBar = document.querySelector('[data-scroll-progress]');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const desktop = matchMedia('(min-width: 761px)');
const heroTrack = document.querySelector('.hero-track');
const manifesto = document.querySelector('.manifesto');
const journey = document.querySelector('.projects-journey');
const projectWindow = document.querySelector('.project-window');
const projectGrid = document.querySelector('.project-grid');
const sceneSteps = [...document.querySelectorAll('.scene-steps span')];
const skills = [...document.querySelectorAll('.skills span')];
const contact = document.querySelector('.contact');
let cinematic = false;
let horizontal = false;
let horizontalDistance = 0;
const clamp = (n, low = 0, high = 1) => Math.min(high, Math.max(low, n));
document.querySelector('[data-year]').textContent = new Date().getFullYear();
function closeMenu(returnFocus = false) {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('.sr-only').textContent = 'Abrir menu';
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  nav.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.querySelector('.sr-only').textContent = open ? 'Fechar menu' : 'Abrir menu';
});
navLinks.forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) closeMenu(true);
});
document.addEventListener('click', event => {
  if (!header.contains(event.target)) closeMenu();
});
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06 });
  document.querySelectorAll('.reveal:not(.project-card)').forEach(el => observer.observe(el));
  document.documentElement.classList.add('motion-ready');
}
let pending = false;
let stacking = false;
function configureMotion() {
  cinematic = !reducedMotion.matches && innerHeight > 540;
  horizontal = cinematic && innerWidth >= 1000 && innerHeight >= 650;
  stacking = false;
  document.documentElement.classList.remove('stack-enabled');
  document.documentElement.classList.toggle('cinematic', cinematic);
  document.documentElement.classList.toggle('horizontal-projects', horizontal);
  horizontalDistance = horizontal ? Math.max(0, projectGrid.scrollWidth - projectWindow.clientWidth) : 0;
  journey.style.height = horizontal ? (horizontalDistance + innerHeight) + 'px' : '';
  if (!desktop.matches) closeMenu();
  scheduleUpdate();
}
function updateScroll() {
  pending = false;
  const height = innerHeight;
  const scrollRange = document.documentElement.scrollHeight - height;
  progressBar.style.transform = `scaleX(${scrollRange > 0 ? clamp(scrollY / scrollRange) : 0})`;
  header.classList.toggle('scrolled', scrollY > 20);
  let currentSection = sections[0].id;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= height * .45) currentSection = section.id;
  }
  navLinks.forEach(link => {
    const active = link.hash === '#' + currentSection;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  updateNarrative(height);

}
function scheduleUpdate() {
  if (!pending) { pending = true; requestAnimationFrame(updateScroll); }
}
addEventListener('scroll', scheduleUpdate, { passive: true });
addEventListener('resize', configureMotion, { passive: true });
reducedMotion.addEventListener('change', configureMotion);
desktop.addEventListener('change', configureMotion);
addEventListener('load', configureMotion);
// Bring keyboard-focused project links into the horizontal viewport.
projectGrid.addEventListener('focusin', event => {
  const card = event.target.closest('.project-card');
  if (horizontal && card) {
    const index = cards.indexOf(card);
    const start = journey.getBoundingClientRect().top + scrollY - 80;
    const stride = cards[0].offsetWidth + 28;
    scrollTo({top: start + Math.min(index * stride, horizontalDistance), behavior: 'instant'});
    projectWindow.scrollLeft = 0;
  }
});
function updateNarrative(height) {
  const heroRect = heroTrack.getBoundingClientRect();
  const hp = cinematic ? clamp((80 - heroRect.top) / Math.max(1, heroTrack.offsetHeight - hero.offsetHeight)) : 0;
  hero.style.setProperty('--hero-p', hp.toFixed(4));
  hero.style.setProperty('--name-shift', (hp * (desktop.matches ? innerWidth * .27 : 55)) + 'px');
  hero.style.setProperty('--star-turn', (-12 + hp * 210) + 'deg');
  hero.style.setProperty('--portrait-scale', (1 + hp * .38).toFixed(3));
  hero.style.setProperty('--portrait-turn', (-5 + hp * 12) + 'deg');
  hero.style.setProperty('--portrait-rise', (-hp * (desktop.matches ? 100 : 25)) + 'px');
  const mr = manifesto.getBoundingClientRect();
  const mp = cinematic ? clamp((80 - mr.top) / Math.max(1, manifesto.offsetHeight - (height - 80))) : 1;
  manifesto.style.setProperty('--manifesto-p', mp.toFixed(4));
  const phase = clamp(mp * 2, 0, 2);
  document.querySelectorAll('.manifesto-word').forEach((word, i) => {
    const delta = phase - i;
    word.style.setProperty('--word-opacity', cinematic ? clamp(1 - Math.abs(delta) * 1.65).toFixed(3) : '1');
    word.style.setProperty('--word-y', cinematic ? (-delta * 110) + '%' : '0%');
    word.style.setProperty('--word-scale', cinematic ? (1 - Math.min(Math.abs(delta), 1) * .15).toFixed(3) : '1');
  });
  sceneSteps.forEach((step, i) => step.classList.toggle('active', i === Math.round(phase)));
  const marqueeRect = marquee.parentElement.getBoundingClientRect();
  marquee.style.setProperty('--marquee-x', reducedMotion.matches ? '0px' : (-clamp((height - marqueeRect.top) / (height + marqueeRect.height)) * 650) + 'px');
  const aboutRect = about.getBoundingClientRect();
  about.style.setProperty('--read-progress', reducedMotion.matches ? '1' : String(clamp((height * .85 - aboutRect.top) / (height * .5))));
  skills.forEach((skill, i) => {
    const rect = skill.getBoundingClientRect();
    const sp = reducedMotion.matches ? 1 : clamp((height * .94 - rect.top) / 160 - (i % 5) * .06);
    skill.style.opacity = .3 + sp * .7;
  });
  let currentCard = 0;
  if (horizontal) {
    const travel = clamp(80 - journey.getBoundingClientRect().top, 0, horizontalDistance);
    projectGrid.style.transform = 'translate3d(' + -travel + 'px,0,0)';
    currentCard = Math.min(cards.length - 1, Math.round(travel / (cards[0].offsetWidth + 28)));
    journey.style.setProperty('--journey-p', horizontalDistance ? travel / horizontalDistance : 0);
  } else projectGrid.style.transform = '';
  cards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    if (!horizontal && rect.top <= height * .6) currentCard = index;
    const progress = horizontal ? clamp((innerWidth - rect.left) / (innerWidth + rect.width)) : clamp((height - rect.top) / (height + rect.height));
    card.style.setProperty('--art-turn', reducedMotion.matches ? '0deg' : (progress * 140 - 50) + 'deg');
    card.style.setProperty('--visual-shift', reducedMotion.matches ? '0px' : ((progress - .5) * 70) + 'px');
    card.style.setProperty('--visual-scale', reducedMotion.matches ? '1' : String(1.08 - progress * .08));
  });
  projectCount.textContent = String(currentCard + 1).padStart(2, '0') + ' / 04';
  const cr = contact.getBoundingClientRect();
  const cp = reducedMotion.matches ? 1 : clamp((height - cr.top) / (height * .75));
  contact.style.setProperty('--contact-p', cp.toFixed(4));
  contact.style.setProperty('--art-turn', (cp * 120) + 'deg');
}
configureMotion();

// Copper cursor with a short, fading trail; no persistent animation loop.
(() => {
  const pointer = matchMedia('(any-pointer: fine)');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const layer = document.createElement('div');
  layer.className = 'pointer-layer';
  layer.setAttribute('aria-hidden', 'true');
  const cursor = document.createElement('div');
  cursor.className = 'copper-cursor';
  layer.append(cursor);
  const particles = Array.from({ length: 28 }, () => {
    const element = document.createElement('i');
    element.className = 'cursor-trail';
    layer.append(element);
    return { element, born: -Infinity, x: 0, y: 0 };
  });
  document.body.append(layer);
  let frame = 0, next = 0, previous = null;
  const lifetime = 480;
  const enabled = () => pointer.matches && !motion.matches;
  function clear() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = null;
    document.documentElement.classList.remove('copper-pointer');
    cursor.classList.remove('is-visible', 'is-pressed');
    particles.forEach(p => { p.born = -Infinity; p.element.style.opacity = '0'; });
  }
  function paint(now) {
    frame = 0;
    let alive = false;
    particles.forEach(p => {
      const remaining = Math.max(0, 1 - (now - p.born) / lifetime);
      p.element.style.opacity = String(remaining * .55);
      if (remaining > 0) {
        alive = true;
        p.element.style.transform = `translate3d(${p.x}px,${p.y}px,0) scale(${remaining})`;
      }
    });
    if (alive) frame = requestAnimationFrame(paint);
  }
  function emit(x, y, born) {
    const p = particles[next];
    next = (next + 1) % particles.length;
    p.x = x; p.y = y; p.born = born;
  }
  document.addEventListener('pointermove', event => {
    if (!enabled() || event.pointerType !== 'mouse') { clear(); return; }
    const x = event.clientX, y = event.clientY;
    cursor.style.transform = `translate3d(${x}px,${y}px,0)`;
    cursor.classList.add('is-visible');
    document.documentElement.classList.add('copper-pointer');
    cursor.classList.toggle('is-link', !!event.target.closest('a,button,input,textarea,select,[role="button"]'));
    const now = performance.now();
    if (previous) {
      const distance = Math.hypot(x - previous.x, y - previous.y);
      if (distance >= 5) {
        const count = Math.min(12, Math.ceil(distance / 7));
        for (let i = 1; i <= count; i++) emit(previous.x + (x - previous.x) * i / count, previous.y + (y - previous.y) * i / count, now);
        previous = { x, y };
      }
    } else { previous = { x, y }; emit(x, y, now); }
    if (!frame) frame = requestAnimationFrame(paint);
  }, { passive: true });
  document.addEventListener('pointerdown', () => cursor.classList.add('is-pressed'), { passive: true });
  document.addEventListener('pointerup', () => cursor.classList.remove('is-pressed'), { passive: true });
  document.documentElement.addEventListener('pointerleave', clear);
  window.addEventListener('blur', clear);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
  pointer.addEventListener('change', clear);
  motion.addEventListener('change', clear);
})();
