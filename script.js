/**
 * Gushwork Assignment - script.js
 * Mangalam HDPE Pipes - Product Page
 *
 * Features:
 * 1. Sticky Header  - shows on scroll down past hero, hides on scroll up
 * 2. Main carousel  - product image slider with thumbnail sync
 * 3. Zoom preview   - hover zoom on thumbnails
 * 4. Applications carousel - full-width image card slider
 * 5. FAQ accordion  - expand/collapse questions
 * 6. Process tabs   - tab switching for manufacturing steps
 * 7. Mobile menu    - hamburger toggle
 */

/* ── DOM REFERENCES ── */
const stickyHeader     = document.getElementById('stickyHeader');
const mainNav          = document.getElementById('mainNav');
const heroSection      = document.getElementById('productHero');
const hamburger        = document.getElementById('hamburger');
const mobileMenu       = document.getElementById('mobileMenu');
const heroTrack        = document.getElementById('heroTrack');
const heroPrev         = document.getElementById('heroPrev');
const heroNext         = document.getElementById('heroNext');
const thumbnails       = document.querySelectorAll('.thumbnail');
const appCarousel      = document.getElementById('appCarousel');
const appPrev          = document.getElementById('appPrev');
const appNext          = document.getElementById('appNext');
const faqItems         = document.querySelectorAll('.faq-item');
const processTabs      = document.querySelectorAll('.process-tab');
const processPanels    = document.querySelectorAll('.process-panel');

/* ================================================
   1. STICKY HEADER
   Shows when user scrolls past the hero (first fold)
   Hides when user scrolls back up toward hero
================================================ */
let lastScrollY = 0;
let ticking     = false;

function onScroll() {
    const currentY  = window.scrollY;
    const heroH     = heroSection ? heroSection.offsetHeight : window.innerHeight;

    /* Add shadow to main nav when scrolled */
    mainNav.classList.toggle('scrolled', currentY > 10);

    /* Sticky header logic */
    if (currentY > heroH) {
        /* Past hero: show when scrolling UP, hide when scrolling DOWN */
        if (currentY < lastScrollY) {
            stickyHeader.classList.add('visible');
        } else {
            stickyHeader.classList.remove('visible');
        }
    } else {
        /* Within hero: always hide sticky header */
        stickyHeader.classList.remove('visible');
    }

    lastScrollY = currentY;
    ticking     = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
    }
}, { passive: true });


/* ================================================
   2. MOBILE MENU
================================================ */
hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    /* Animate hamburger → X */
    const bars = hamburger.querySelectorAll('span');
    if (isOpen) {
        bars[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        bars[1].style.opacity   = '0';
        bars[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
        bars[0].style.transform = '';
        bars[1].style.opacity   = '';
        bars[2].style.transform = '';
    }
});

/* Close mobile menu on outside click */
document.addEventListener('click', (e) => {
    if (!mainNav.contains(e.target) && mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        hamburger.querySelectorAll('span').forEach(b => {
            b.style.transform = '';
            b.style.opacity   = '';
        });
    }
});


/* ================================================
   3. PRODUCT IMAGE CAROUSEL + THUMBNAIL SYNC
================================================ */
let heroIndex     = 0;
const heroSlides  = document.querySelectorAll('.main-carousel__slide');
const totalSlides = heroSlides.length;

function goToSlide(index) {
    /* Clamp index */
    heroIndex = (index + totalSlides) % totalSlides;
    heroTrack.style.transform = `translateX(-${heroIndex * 100}%)`;

    /* Sync thumbnails */
    thumbnails.forEach((t, i) => t.classList.toggle('active', i === heroIndex));

    updateHeroButtons();
}

function updateHeroButtons() {
    heroPrev.disabled = heroIndex === 0;
    heroNext.disabled = heroIndex === totalSlides - 1;
}

heroPrev.addEventListener('click', () => goToSlide(heroIndex - 1));
heroNext.addEventListener('click', () => goToSlide(heroIndex + 1));

/* Thumbnail click — go to that slide */
thumbnails.forEach((thumb, i) => {
    thumb.addEventListener('click', () => goToSlide(i));
});

/* Touch swipe support for hero carousel */
let heroTouchX = 0;
heroTrack.parentElement.addEventListener('touchstart', e => {
    heroTouchX = e.changedTouches[0].screenX;
}, { passive: true });
heroTrack.parentElement.addEventListener('touchend', e => {
    const diff = heroTouchX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 40) goToSlide(heroIndex + (diff > 0 ? 1 : -1));
}, { passive: true });

/* Initialize */
updateHeroButtons();


/* ================================================
   4. APPLICATIONS CAROUSEL (full-width strip)
================================================ */
let appIndex    = 0;
const appCards  = appCarousel.querySelectorAll('.app-card');
const appCount  = appCards.length;

function getAppItemW() {
    if (!appCards[0]) return 0;
    return appCards[0].offsetWidth + 20; /* 20 = gap */
}

function getAppVisible() {
    const w = window.innerWidth;
    if (w <= 480)  return 1;
    if (w <= 800)  return 2;
    if (w <= 1080) return 3;
    return 4;
}

function goToApp(index) {
    const maxIndex = appCount - getAppVisible();
    appIndex = Math.max(0, Math.min(index, maxIndex));
    appCarousel.style.transform = `translateX(-${appIndex * getAppItemW()}px)`;
    appPrev.disabled = appIndex === 0;
    appNext.disabled = appIndex >= maxIndex;
}

appPrev.addEventListener('click', () => goToApp(appIndex - 1));
appNext.addEventListener('click', () => goToApp(appIndex + 1));

/* Touch swipe for applications carousel */
let appTouchX = 0;
appCarousel.addEventListener('touchstart', e => {
    appTouchX = e.changedTouches[0].screenX;
}, { passive: true });
appCarousel.addEventListener('touchend', e => {
    const diff = appTouchX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 40) goToApp(appIndex + (diff > 0 ? 1 : -1));
}, { passive: true });

/* Recalculate on resize */
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        appIndex = 0;
        goToApp(0);
    }, 200);
});

/* Initialize */
goToApp(0);


/* ================================================
   5. FAQ ACCORDION
================================================ */
faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        /* Close all */
        faqItems.forEach(f => {
            f.classList.remove('open');
            f.querySelector('.faq-icon').textContent = '∨';
        });

        /* Open clicked (unless it was already open) */
        if (!isOpen) {
            item.classList.add('open');
            item.querySelector('.faq-icon').textContent = '∧';
        }
    });
});

/* Set first item icon */
const firstFaqIcon = document.querySelector('.faq-item.open .faq-icon');
if (firstFaqIcon) firstFaqIcon.textContent = '∧';


/* ================================================
   6. MANUFACTURING PROCESS TABS
================================================ */
processTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabIndex = tab.dataset.tab;

        /* Update tab active state */
        processTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        /* Show corresponding panel */
        processPanels.forEach(p => p.classList.remove('active'));
        const panel = document.getElementById(`tab-${tabIndex}`);
        if (panel) panel.classList.add('active');
    });
});


/* ================================================
   7. SMOOTH SCROLL for anchor links
================================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});


/* ================================================
   8. KEYBOARD NAVIGATION
   Arrow keys for both carousels when in view
================================================ */
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goToSlide(heroIndex - 1);
    if (e.key === 'ArrowRight') goToSlide(heroIndex + 1);
});


/* ================================================
   MODAL FUNCTIONS
================================================ */

/**
 * Open a modal by ID
 * Adds .open class → CSS transition shows it
 */
function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden'; /* prevent bg scroll */
}

/**
 * Close a modal by ID
 */
function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
}

/**
 * Close modal when clicking the dark overlay (outside modal box)
 */
function closeModalOutside(event, id) {
    if (event.target === event.currentTarget) {
        closeModal(id);
    }
}

/* Close modals with Escape key */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(m => {
            m.classList.remove('open');
        });
        document.body.style.overflow = '';
    }
});

/* Enable Download Brochure button only when email is filled */
const catalogueEmailInput = document.querySelector('#catalogueModal .modal-input');
const downloadBtn = document.querySelector('.modal-submit--disabled');
if (catalogueEmailInput && downloadBtn) {
    catalogueEmailInput.addEventListener('input', () => {
        if (catalogueEmailInput.value.includes('@')) {
            downloadBtn.classList.remove('modal-submit--disabled');
        } else {
            downloadBtn.classList.add('modal-submit--disabled');
        }
    });
}
