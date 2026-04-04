// =========================================
// Core Recruit — Shared JS + CMS Loader
// =========================================

// Mobile menu
document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target))
        mobileMenu.classList.remove('open');
    });
  }

  // Fade-in on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // Active nav
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav ul li a, .mobile-menu a').forEach(link => {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });
});

// =========================================
// CMS CONTENT LOADER
// Reads markdown files from /content/ folders
// Falls back to embedded demo data if files not found
// =========================================

// Parse YAML front matter from markdown string
function parseFrontMatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { meta: {}, body: text };
  const meta = {};
  match[1].split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) {
      let val = rest.join(':').trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
      meta[key.trim()] = val;
    }
  });
  return { meta, body: text.replace(/^---\n[\s\S]*?\n---\n?/, '') };
}

// Fetch a JSON or Markdown file from /content/
async function fetchContent(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Not found');
    return await res.text();
  } catch (e) {
    return null;
  }
}

// Load all markdown files from a list of slugs
async function loadCollection(folder, slugs) {
  const results = [];
  for (const slug of slugs) {
    const text = await fetchContent(`/content/${folder}/${slug}.md`);
    if (text) {
      const { meta, body } = parseFrontMatter(text);
      results.push({ ...meta, body, slug });
    }
  }
  return results;
}

// Load JSON settings file
async function loadSettings(file) {
  const text = await fetchContent(`/content/settings/${file}.json`);
  if (text) {
    try { return JSON.parse(text); } catch(e) { return null; }
  }
  return null;
}

// Apply contact settings to footer elements (all pages)
async function applyContactSettings() {
  const s = await loadSettings('contact');
  if (!s) return;
  document.querySelectorAll('[data-contact="email"]').forEach(el => { el.textContent = s.email; if(el.tagName==='A') el.href='mailto:'+s.email; });
  document.querySelectorAll('[data-contact="phone"]').forEach(el => { el.textContent = s.phone; if(el.tagName==='A') el.href='tel:+40'+s.phone.replace(/\s/g,''); });
  document.querySelectorAll('[data-contact="address"]').forEach(el => el.textContent = s.address);
  document.querySelectorAll('[data-contact="city"]').forEach(el => el.textContent = s.city);
  document.querySelectorAll('[data-contact="facebook"]').forEach(el => el.href = s.facebook);
  document.querySelectorAll('[data-contact="linkedin"]').forEach(el => el.href = s.linkedin);
  document.querySelectorAll('[data-contact="maps"]').forEach(el => el.href = s.maps);
}

document.addEventListener('DOMContentLoaded', applyContactSettings);

// Export for use in individual pages
window.CMS = { parseFrontMatter, fetchContent, loadCollection, loadSettings };


// =========================================
// LOGO LOADER — loads from CMS settings
// =========================================
async function loadSiteLogo() {
  try {
    const res = await fetch('/content/settings/site.json');
    if (!res.ok) return;
    const data = await res.json();
    if (data.logo && data.logo.trim()) {
      // CMS logo available — show image, hide text
      ['nav-logo-img','footer-logo-img'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.src = data.logo; el.style.display = 'block'; }
      });
      document.querySelectorAll('.logo-text,.footer-logo-text').forEach(el => el.style.display = 'none');
    } else {
      // No CMS logo — hide image, show text
      ['nav-logo-img','footer-logo-img'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      document.querySelectorAll('.logo-text,.footer-logo-text').forEach(el => el.style.display = 'inline');
    }
  } catch(e) {
    // On error hide image fallback to text
    ['nav-logo-img','footer-logo-img'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    document.querySelectorAll('.logo-text,.footer-logo-text').forEach(el => el.style.display = 'inline');
  }
}

document.addEventListener('DOMContentLoaded', loadSiteLogo);
