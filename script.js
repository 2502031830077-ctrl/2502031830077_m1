// ============================================
// Footer year
// ============================================
document.getElementById('year').textContent = new Date().getFullYear();

// ============================================
// Mobile menu toggle
// ============================================
const menuToggle = document.getElementById('menuToggle');
const mobileTabs = document.getElementById('mobileTabs');

menuToggle.addEventListener('click', () => {
  const isOpen = mobileTabs.classList.toggle('open');
  menuToggle.classList.toggle('is-open', isOpen);
  menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});

// Close mobile menu after tapping a link
mobileTabs.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileTabs.classList.remove('open');
    menuToggle.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

// ============================================
// Scroll-spy: highlight active tab based on section in view
// ============================================
const sections = document.querySelectorAll('main section[id]');
const allTabs = document.querySelectorAll('.tab');

const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      allTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.target === id);
      });
    }
  });
}, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

sections.forEach(section => spyObserver.observe(section));

// ============================================
// Scroll reveal for cards
// ============================================
const revealTargets = document.querySelectorAll(
  '.skill-card, .timeline-item, .project-card, .strength-card, .edu-card, .contact-card'
);

revealTargets.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealTargets.forEach(el => revealObserver.observe(el));

// ============================================
// Contact form (front-end only — no backend wired up)
// ============================================
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = contactForm.elements['name'].value.trim();

  formNote.textContent = `Thanks${name ? ', ' + name.split(' ')[0] : ''} — this form isn't connected to an inbox yet. Please email rajanparmar609@gmail.com directly for now.`;
  contactForm.reset();
});