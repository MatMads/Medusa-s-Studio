/**
 * MEDUSA'S STUDIO — redesign editorial (conceito)
 * script.js independente do site original.
 */

'use strict';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ============================================================
   MARQUEE — duplica os itens para o loop de -50% ficar contínuo
   ============================================================ */
function initMarquee() {
  $$('.marquee__track').forEach(track => {
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.after(clone);
    track.parentElement.style.display = 'flex';
  });
}

/* ============================================================
   HEADER — fundo ao rolar + link ativo
   ============================================================ */
function initHeader() {
  const header = $('#header');
  if (!header) return;

  const THRESHOLD = 40;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > THRESHOLD);
  update();
  window.addEventListener('scroll', update, { passive: true });

  const links = $$('.nav__link[data-section]');
  const sections = $$('main section[id], main > .hero');
  if (!links.length || !sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id || 'topo';
      links.forEach(l => l.classList.toggle('is-active', l.dataset.section === id));
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
}

/* ============================================================
   MENU MOBILE
   ============================================================ */
function initMenu() {
  const burger = $('#burger');
  const nav = $('#nav');
  if (!burger || !nav) return;

  const close = () => {
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  };
  const toggle = () => {
    const open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  };

  burger.addEventListener('click', toggle);
  $$('.nav__link', nav).forEach(l => l.addEventListener('click', close));
  document.addEventListener('keydown', e => e.key === 'Escape' && close());
}

/* ============================================================
   REVEAL ON SCROLL
   ============================================================ */
function initReveal() {
  const targets = $$('[data-reveal]');
  targets.forEach(el => el.classList.add('reveal'));
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -70px 0px', threshold: .08 });

  targets.forEach(el => observer.observe(el));
}

/* ============================================================
   PORTFÓLIO — abas
   ============================================================ */
function initTabs() {
  const tabs = $$('.tabs__btn');
  const panels = $$('.panel');
  if (!tabs.length) return;

  function activate(tab) {
    const target = tab.dataset.tab;
    tabs.forEach(t => {
      const active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
    });
    panels.forEach(p => {
      const isTarget = p.id === `panel-${target}`;
      p.hidden = !isTarget;
    });
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      next.focus();
      activate(next);
    });
  });
}

/* ============================================================
   MODAL — galeria com foco preso e navegação por seta/botão
   ============================================================ */
function initModal() {
  const modal = $('#modal');
  const img = $('#modal-img');
  const caption = $('#modal-caption');
  const closeBtn = $('#modal-close');
  const prevBtn = $('#modal-prev');
  const nextBtn = $('#modal-next');
  const backdrop = $('#modal-backdrop');
  const chips = $$('.chip');
  if (!modal) return;

  let lastFocused = null;
  let gallery = [];
  let index = -1;

  function render() {
    const item = gallery[index];
    const el = item.el || item;
    const imgEl = $('img', el);
    img.src = el.dataset.src;
    img.alt = imgEl ? imgEl.alt : '';
    caption.textContent = el.dataset.caption || '';
    const multi = gallery.length > 1;
    prevBtn.hidden = !multi;
    nextBtn.hidden = !multi;
  }

  function open() {
    lastFocused = document.activeElement;
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    render();
    requestAnimationFrame(() => closeBtn.focus());
  }

  function close() {
    modal.setAttribute('hidden', '');
    img.src = '';
    document.body.style.overflow = '';
    gallery = [];
    index = -1;
    if (lastFocused) lastFocused.focus();
  }

  function step(delta) {
    if (!gallery.length) return;
    index = (index + delta + gallery.length) % gallery.length;
    render();
  }

  $$('.bento__item').forEach(item => {
    item.addEventListener('click', () => {
      const panel = item.closest('.panel');
      gallery = panel ? $$('.bento__item', panel) : [item];
      index = gallery.indexOf(item);
      open();
    });
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); }
    });
  });

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      gallery = [chip];
      index = 0;
      open();
    });
    chip.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chip.click(); }
    });
  });

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));

  document.addEventListener('keydown', e => {
    if (modal.hasAttribute('hidden')) return;

    if (e.key === 'Escape') return close();
    if (gallery.length > 1 && e.key === 'ArrowRight') return step(1);
    if (gallery.length > 1 && e.key === 'ArrowLeft') return step(-1);

    if (e.key === 'Tab') {
      const focusables = gallery.length > 1
        ? [prevBtn, closeBtn, nextBtn]
        : [closeBtn];
      e.preventDefault();
      const current = focusables.indexOf(document.activeElement);
      const dir = e.shiftKey ? -1 : 1;
      const nextEl = focusables[(current + dir + focusables.length) % focusables.length] || closeBtn;
      nextEl.focus();
    }
  });
}

/* ============================================================
   WHATSAPP FLUTUANTE — aparece após rolar
   ============================================================ */
function initFloatWhatsapp() {
  const btn = $('#float-wpp');
  if (!btn) return;
  const THRESHOLD = window.innerHeight * .6;
  const update = () => btn.classList.toggle('is-visible', window.scrollY > THRESHOLD);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
  initMarquee();
  initHeader();
  initMenu();
  initReveal();
  initTabs();
  initModal();
  initFloatWhatsapp();
});
