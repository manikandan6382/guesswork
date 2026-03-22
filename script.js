
const stickyHeader     = document.getElementById('stickyHeader');
const mainNav          = document.getElementById('mainNav');
const heroSection      = document.getElementById('productHero');
const hamburger        = document.getElementById('hamburger');
const mobileMenu       = document.getElementById('mobileMenu');
const heroTrack        = document.getElementById('heroTrack');
const heroPrev         = document.getElementById('heroPrev');
const heroNext         = document.getElementById('heroNext');
const thumbnailsTrack  = document.getElementById('thumbnails');
const thumbnails       = document.querySelectorAll('.thumbnail');
const thumbnailsTrackWrap = thumbnailsTrack ? thumbnailsTrack.parentElement : null;
const appCarousel      = document.getElementById('appCarousel');
const appPrev          = document.getElementById('appPrev');
const appNext          = document.getElementById('appNext');
const faqItems         = document.querySelectorAll('.faq-item');
const processTabs      = document.querySelectorAll('.process-tab');
const processPanels    = document.querySelectorAll('.process-panel');
const processImageTrack = document.getElementById('processImageTrack');
const processImagePrev = document.getElementById('processImagePrev');
const processImageNext = document.getElementById('processImageNext');
const processMobileStep = document.getElementById('processMobileStep');
const processMobilePrev = document.getElementById('processMobilePrev');
const processMobileNext = document.getElementById('processMobileNext');
const testimonialsTrack = document.getElementById('testimonialsTrack');
const testimonialsTrackWrap = document.querySelector('.testimonials-track-wrap');

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
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
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
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
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

function getAppItemW() {
    if (!appCards[0]) return 0;
    const gap = parseFloat(window.getComputedStyle(appCarousel).gap) || 20;
    return appCards[0].offsetWidth + gap;
}

function getAppMaxTranslate() {
    if (!appCarousel || !appCarousel.parentElement) return 0;
    const wrapStyles = window.getComputedStyle(appCarousel.parentElement);
    const paddingLeft = parseFloat(wrapStyles.paddingLeft) || 0;
    const paddingRight = parseFloat(wrapStyles.paddingRight) || 0;
    const visibleWidth = appCarousel.parentElement.clientWidth - paddingLeft - paddingRight;

    return Math.max(0, appCarousel.scrollWidth - visibleWidth);
}

function goToApp(index) {
    const itemWidth = getAppItemW();
    const maxTranslate = getAppMaxTranslate();
    const maxIndex = itemWidth ? Math.max(0, Math.ceil(maxTranslate / itemWidth)) : 0;

    appIndex = Math.max(0, Math.min(index, maxIndex));

    const translateX = Math.min(appIndex * itemWidth, maxTranslate);
    appCarousel.style.transform = `translateX(-${translateX}px)`;

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
        syncTestimonialsEndSpace();
    }, 200);
});

/* Initialize */
goToApp(0);


/* ================================================
   4A. PROCESS RAW MATERIAL IMAGE CAROUSEL
================================================ */
let processImageIndex = 0;
const processImageSlides = processImageTrack ? processImageTrack.querySelectorAll('.process-image-carousel__slide') : [];
const processImageCount = processImageSlides.length;

function updateProcessImageButtons() {
    if (!processImagePrev || !processImageNext) return;
    processImagePrev.disabled = processImageIndex === 0;
    processImageNext.disabled = processImageIndex === processImageCount - 1;
}

function goToProcessImage(index) {
    if (!processImageTrack || !processImageCount) return;

    processImageIndex = Math.max(0, Math.min(index, processImageCount - 1));
    processImageTrack.style.transform = `translateX(-${processImageIndex * 100}%)`;
    updateProcessImageButtons();
}

if (processImagePrev) {
    processImagePrev.addEventListener('click', () => goToProcessImage(processImageIndex - 1));
}

if (processImageNext) {
    processImageNext.addEventListener('click', () => goToProcessImage(processImageIndex + 1));
}

goToProcessImage(0);


/* ================================================
   4B. DRAG SCROLL
================================================ */
function enableDragScroll(element, draggingClass) {
    if (!element) return;

    let isDragging = false;
    let dragStartX = 0;
    let dragStartScrollLeft = 0;
    let touchStartX = 0;
    let touchStartScrollLeft = 0;

    const stopDragging = () => {
        isDragging = false;
        if (draggingClass) element.classList.remove(draggingClass);
    };

    element.addEventListener('mousedown', (event) => {
        isDragging = true;
        dragStartX = event.pageX;
        dragStartScrollLeft = element.scrollLeft;
        if (draggingClass) element.classList.add(draggingClass);
    });

    element.addEventListener('mousemove', (event) => {
        if (!isDragging) return;
        event.preventDefault();
        const dragDistance = event.pageX - dragStartX;
        element.scrollLeft = dragStartScrollLeft - dragDistance;
    });

    element.addEventListener('mouseleave', stopDragging);
    element.addEventListener('mouseup', stopDragging);
    window.addEventListener('mouseup', stopDragging);

    element.addEventListener('touchstart', (event) => {
        touchStartX = event.touches[0].pageX;
        touchStartScrollLeft = element.scrollLeft;
    }, { passive: true });

    element.addEventListener('touchmove', (event) => {
        const dragDistance = event.touches[0].pageX - touchStartX;
        element.scrollLeft = touchStartScrollLeft - dragDistance;
    }, { passive: true });
}

function syncTestimonialsEndSpace() {
    if (!testimonialsTrack) return;

    let endSpacer = testimonialsTrack.querySelector('.testimonials-end-space');

    if (!endSpacer) {
        endSpacer = document.createElement('div');
        endSpacer.className = 'testimonials-end-space';
        endSpacer.setAttribute('aria-hidden', 'true');
        endSpacer.style.flex = '0 0 auto';
        endSpacer.style.pointerEvents = 'none';
        testimonialsTrack.appendChild(endSpacer);
    }

    endSpacer.style.width = window.innerWidth <= 480 ? '16px' : '56px';
}

syncTestimonialsEndSpace();
enableDragScroll(testimonialsTrackWrap, 'is-dragging');
enableDragScroll(thumbnailsTrackWrap, 'is-dragging');


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
            f.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });

        /* Open clicked (unless it was already open) */
        if (!isOpen) {
            item.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
        }
    });
});

/* ================================================
   6. MANUFACTURING PROCESS TABS
================================================ */
let activeProcessIndex = 0;

function updateProcessUI(index) {
    if (!processTabs.length || !processPanels.length) return;

    activeProcessIndex = Math.max(0, Math.min(index, processTabs.length - 1));

    processTabs.forEach((tab, tabIndex) => {
        tab.classList.toggle('active', tabIndex === activeProcessIndex);
        tab.setAttribute('aria-pressed', String(tabIndex === activeProcessIndex));
    });

    processPanels.forEach((panel, panelIndex) => {
        panel.classList.toggle('active', panelIndex === activeProcessIndex);
    });

    const activeTab = processTabs[activeProcessIndex];
    const activeLabel = activeTab ? activeTab.textContent.trim() : '';

    if (processMobileStep) {
        processMobileStep.textContent = `Step ${activeProcessIndex + 1}/${processTabs.length}: ${activeLabel}`;
    }

    const isFirst = activeProcessIndex === 0;
    const isLast = activeProcessIndex === processTabs.length - 1;

    if (processMobilePrev) processMobilePrev.disabled = isFirst;
    if (processMobileNext) processMobileNext.disabled = isLast;
}

processTabs.forEach((tab, tabIndex) => {
    tab.addEventListener('click', () => {
        updateProcessUI(tabIndex);
    });
});

if (processMobilePrev) {
    processMobilePrev.addEventListener('click', () => updateProcessUI(activeProcessIndex - 1));
}

if (processMobileNext) {
    processMobileNext.addEventListener('click', () => updateProcessUI(activeProcessIndex + 1));
}

updateProcessUI(0);


/* ================================================
   7. SMOOTH SCROLL for anchor links
================================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
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
