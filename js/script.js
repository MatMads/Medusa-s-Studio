/**
 * MEDUSA'S STUDIO — script.js
 *
 * Organizado por responsabilidade:
 *  1. Utilitários internos
 *  2. Menu mobile (hambúrguer)
 *  3. Header – comportamento ao rolar
 *  4. Navegação – estado ativo (IntersectionObserver)
 *  5. Portfólio – alternância de abas
 *  6. Portfólio – modal de imagem
 *  7. Animações de scroll (IntersectionObserver)
 *  8. Hero – animação de carregamento
 * 9. Inicialização central
 */

'use strict';

/* ============================================================
   1. UTILITÁRIOS
   ============================================================ */

/** Atalho para document.querySelector */
const $ = (selector, root = document) => root.querySelector(selector);

/** Atalho para document.querySelectorAll → Array */
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];


/* ============================================================
   2. MENU MOBILE — hambúrguer
   ============================================================ */

function initMobileMenu() {
  const toggle = $('#menu-toggle');
  const nav = $('#main-nav');
  const navLinks = $$('.nav__link');

  if (!toggle || !nav) return;

  /** Abre o menu */
  function openMenu() {
    nav.classList.add('is-open');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  /** Fecha o menu */
  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  /** Alterna o menu */
  function toggleMenu() {
    nav.classList.contains('is-open') ? closeMenu() : openMenu();
  }

  // Clique no botão hambúrguer
  toggle.addEventListener('click', toggleMenu);

  // Clique em qualquer link fecha o menu
  navLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Clique fora da nav fecha o menu
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      closeMenu();
    }
  });

  // ESC fecha o menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}


/* ============================================================
   3. HEADER — comportamento ao rolar
   ============================================================ */

function initHeaderScroll() {
  const header = $('#header');
  if (!header) return;

  /** Altura de scroll que dispara o fundo do header */
  const THRESHOLD = 60;

  function updateHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > THRESHOLD);
  }

  // Verifica imediatamente (caso a página já esteja rolada ao carregar)
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}


/* ============================================================
   4. NAVEGAÇÃO — destaque do link ativo com IntersectionObserver
   ============================================================ */

function initActiveNav() {
  const navLinks = $$('.nav__link[data-section]');
  const sections = $$('main section[id]');

  if (!navLinks.length || !sections.length) return;

  /** Marca como ativo o link correspondente ao id da seção */
  function setActive(sectionId) {
    navLinks.forEach(link => {
      // O link CTA ("Agendar") não recebe a classe is-active
      if (link.classList.contains('nav__link--cta')) return;
      link.classList.toggle('is-active', link.dataset.section === sectionId);
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    {
      // Dispara quando a seção está no terço central da viewport
      rootMargin: '-35% 0px -55% 0px',
      threshold: 0,
    }
  );

  sections.forEach(section => observer.observe(section));
}


/* ============================================================
   5. PORTFÓLIO — alternância de abas (Tattoos / Piercings)
   ============================================================ */

function initPortfolioTabs() {
  const tabs = $$('.portfolio__tab');
  const panels = $$('.portfolio__panel');

  if (!tabs.length || !panels.length) return;

  /**
   * Ativa a aba clicada e exibe o painel correspondente.
   * @param {HTMLButtonElement} activeTab
   */
  function activateTab(activeTab) {
    const targetId = activeTab.dataset.tab;

    // Atualiza estado das abas
    tabs.forEach(tab => {
      const isActive = tab === activeTab;
      tab.classList.toggle('portfolio__tab--active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    // Mostra/esconde painéis
    panels.forEach(panel => {
      const isTarget = panel.id === `panel-${targetId}`;
      panel.hidden = !isTarget;
      panel.classList.toggle('portfolio__panel--active', isTarget);
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab));

    // Suporte a teclado (Enter / Space)
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateTab(tab);
      }
    });
  });
}


/* ============================================================
   6. PORTFÓLIO — modal de visualização ampliada
   ============================================================ */

function initPortfolioModal() {
  const modal = $('#portfolio-modal');
  const img = $('#modal-img');
  const caption = $('#modal-caption');
  const closeBtn = $('#modal-close-btn');
  const backdrop = $('#modal-backdrop');
  const items = $$('.portfolio__item');
  const badges = $$('.badge--clickable');

  if (!modal) return;

  /** Elemento focado antes de abrir o modal (para restaurar o foco ao fechar) */
  let lastFocused = null;

  /**
   * Abre o modal com a imagem e legenda fornecidas.
   * @param {string} src     - Caminho da imagem
   * @param {string} alt     - Texto alternativo
   * @param {string} cap     - Legenda exibida abaixo
   */
  function openModal(src, alt, cap) {
    lastFocused = document.activeElement;

    img.src = src;
    img.alt = alt || 'Imagem do portfólio';
    caption.textContent = cap || '';

    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';

    // Move o foco para o botão de fechar (acessibilidade)
    requestAnimationFrame(() => closeBtn.focus());
  }

  /** Fecha o modal e restaura o foco */
  function closeModal() {
    modal.setAttribute('hidden', '');
    img.src = '';
    document.body.style.overflow = '';

    if (lastFocused) {
      lastFocused.focus();
    }
  }

  // Clique nos itens do portfólio
  items.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.dataset.src;
      const cap = item.dataset.caption || '';
      const imgEl = $('img', item);
      const alt = imgEl ? imgEl.alt : '';

      if (src) openModal(src, alt, cap);
    });

    // Teclado: Enter ou Espaço abre o modal
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });

  // Clique nos badges de especialidade (Fine Line, Lettering, Blackwork)
  badges.forEach(badge => {
    badge.addEventListener('click', () => {
      const src = badge.dataset.src;
      const cap = badge.dataset.caption || badge.textContent.trim();
      if (src) openModal(src, cap, cap);
    });

    // Teclado: Enter ou Espaço abre o modal
    badge.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        badge.click();
      }
    });
  });

  // Fechar via botão, backdrop ou ESC
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hasAttribute('hidden')) {
      closeModal();
    }
  });
}


/* ============================================================
   7. ANIMAÇÕES DE SCROLL — fade-in / slide-up ao revelar
   ============================================================ */

function initScrollAnimations() {
  /**
   * Coleta elementos com [data-reveal] e adiciona a classe .reveal
   * para que o CSS cuide da animação.
   */
  const targets = $$('[data-reveal]');
  targets.forEach(el => el.classList.add('reveal'));

  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Anima apenas uma vez
        }
      });
    },
    {
      rootMargin: '0px 0px -70px 0px',
      threshold: 0.08,
    }
  );

  targets.forEach(el => observer.observe(el));
}


/* ============================================================
   8. HERO — animação de carregamento da imagem de fundo
   ============================================================ */

function initHero() {
  const hero = $('.hero');
  const heroImg = $('.hero__bg-img');

  if (!hero) return;

  function markLoaded() {
    hero.classList.add('is-loaded');
  }

  // Se a imagem já está no cache do navegador, dispara imediatamente
  if (heroImg) {
    if (heroImg.complete && heroImg.naturalWidth > 0) {
      markLoaded();
    } else {
      heroImg.addEventListener('load', markLoaded);
    }
  } else {
    markLoaded();
  }
}


/* ============================================================
   9. SCROLL SUAVE — âncoras com offset do header
   ============================================================ */

function initSmoothScroll() {
  // O scroll suave nativo (CSS: scroll-behavior: smooth) + offset via padding-top no body
  // seria suficiente, mas aqui garantimos offset preciso sem CSS scroll-padding.

  const header = $('#header');

  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);

      if (!target) return;

      e.preventDefault();

      const headerH = header ? header.offsetHeight : 80;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}


/* ============================================================
   INICIALIZAÇÃO — DOMContentLoaded
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeaderScroll();
  initActiveNav();
  initPortfolioTabs();
  initPortfolioModal();
  initScrollAnimations();
  initHero();
  initSmoothScroll();
});
