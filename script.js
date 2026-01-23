// ==========================================
// NAVIGATION SCROLL EFFECT (OPTIMIZED)
// ==========================================
const nav = document.querySelector('.nav-glass');
const navLinks = document.querySelector('.nav-links');
const hamburger = document.querySelector('.hamburger');
const langSelector = document.querySelector('.lang-selector');
const langCurrent = document.querySelector('.lang-current');

let navTicking = false;
let lastScrollY = 0;

const updateNavOnScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }

    lastScrollY = currentScrollY;
    navTicking = false;
};

window.addEventListener('scroll', () => {
    if (!navTicking) {
        window.requestAnimationFrame(updateNavOnScroll);
        navTicking = true;
    }
}, { passive: true });

// ==========================================
// MOBILE MENU TOGGLE
// ==========================================
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
    // Close language dropdown if opening menu
    if (langSelector) langSelector.classList.remove('active');
});

// Close menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// ==========================================
// SMOOTH SCROLL WITH OFFSET
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const navHeight = nav.offsetHeight;
            const targetPosition = targetElement.offsetTop - navHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ==========================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ==========================================
const animateOnScroll = () => {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, observerOptions);

    // Observe all elements with data-aos attribute
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);

        // Add delay if specified
        const delay = el.getAttribute('data-delay');
        if (delay) {
            el.style.transitionDelay = `${delay}ms`;
        }
    });
};

// ==========================================
// FORM HANDLING - DISABLED (Using FormSubmit instead)
// ==========================================
// FormSubmit handles the form submission natively
// ==========================================
// AJAX FORM HANDLING
// ==========================================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        // Prevent default submission to stay on page (AJAX)
        e.preventDefault();

        const submitBtn = contactForm.querySelector('.cta-btn');
        const originalText = submitBtn.textContent;

        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours...';
        submitBtn.style.opacity = '0.7';

        const formData = new FormData(contactForm);

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Show success message on button
                submitBtn.textContent = 'Message Envoyé ✓';
                submitBtn.style.background = '#27ae60';
                submitBtn.style.borderColor = '#27ae60';
                submitBtn.style.color = '#ffffff';
                submitBtn.style.opacity = '1';

                // Reset form
                contactForm.reset();

                // Clear any "has-value" classes from floating labels
                const inputs = contactForm.querySelectorAll('input, textarea');
                inputs.forEach(input => input.classList.remove('has-value'));

                // Show toast notification
                showToast('✅ Votre message a bien été envoyé !', 'success');

                // Marketing Tracking: Lead Conversion
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    'event': 'lead_form_submitted',
                    'form_name': 'contact_footer',
                    'service': formData.get('service') || 'general'
                });

                if (typeof fbq === 'function') {
                    fbq('track', 'Lead');
                }

                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.style.borderColor = '';
                    submitBtn.style.color = '';
                    submitBtn.disabled = false;
                }, 5000);
            } else {
                throw new Error('Erreur lors de l\'envoi');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            submitBtn.textContent = 'Erreur - Réessayez';
            submitBtn.style.background = '#e74c3c';
            submitBtn.style.borderColor = '#e74c3c';
            submitBtn.style.color = '#ffffff';
            submitBtn.style.opacity = '1';

            showToast('❌ Erreur lors de l\'envoi du message', 'error');

            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
                submitBtn.style.borderColor = '';
                submitBtn.style.color = '';
                submitBtn.disabled = false;
            }, 3000);
        }
    });
}

// Helper function for Toast notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? '#27ae60' : '#e74c3c';

    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: var(--font-main, sans-serif);
        font-weight: 600;
        transform: translateY(-100px);
        transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
    }, 100);

    // Remove after 5s
    setTimeout(() => {
        toast.style.transform = 'translateY(-100px)';
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}


// ==========================================
// FLOATING LABELS FOR FORM INPUTS
// ==========================================
const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');

formInputs.forEach(input => {
    // Check on page load if input has value
    if (input.value) {
        input.classList.add('has-value');
    }

    // Add/remove class on input
    input.addEventListener('input', () => {
        if (input.value) {
            input.classList.add('has-value');
        } else {
            input.classList.remove('has-value');
        }
    });
});

// ==========================================
// PARALLAX EFFECT ON HERO (OPTIMIZED)
// ==========================================
const hero = document.querySelector('.hero');
const blueprintGraphic = document.querySelector('.blueprint-graphic');

let parallaxTicking = false;

const updateParallax = () => {
    const scrolled = window.pageYOffset;
    const heroBottom = hero.offsetTop + hero.offsetHeight;

    if (scrolled < heroBottom && blueprintGraphic) {
        blueprintGraphic.style.transform = `translateY(${scrolled * 0.3}px)`;
    }

    parallaxTicking = false;
};

window.addEventListener('scroll', () => {
    if (!parallaxTicking) {
        window.requestAnimationFrame(updateParallax);
        parallaxTicking = true;
    }
}, { passive: true });

// ==========================================
// DYNAMIC BACKGROUND FOR PORTFOLIO IMAGES
// ==========================================
const setPortfolioBackgrounds = () => {
    const portfolioImages = document.querySelectorAll('.portfolio-image');

    portfolioImages.forEach((img, index) => {
        // Create a subtle pattern for each portfolio item
        const gradients = [
            'linear-gradient(135deg, #1a2f4b 0%, #2E3E5B 50%, #1a2f4b 100%)',
            'linear-gradient(135deg, #2E3E5B 0%, #1a2f4b 50%, #2E3E5B 100%)',
            'linear-gradient(135deg, #1a2f4b 0%, #3A4A6B 50%, #2E3E5B 100%)',
            'linear-gradient(135deg, #2E3E5B 0%, #3A4A6B 50%, #1a2f4b 100%)'
        ];

        img.style.background = gradients[index % gradients.length];

        // Add animated lines overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
                linear-gradient(45deg, transparent 48%, rgba(204, 148, 97, 0.1) 49%, rgba(204, 148, 97, 0.1) 51%, transparent 52%),
                linear-gradient(-45deg, transparent 48%, rgba(204, 148, 97, 0.1) 49%, rgba(204, 148, 97, 0.1) 51%, transparent 52%);
            background-size: 80px 80px;
            opacity: 0.5;
        `;
        img.appendChild(overlay);
    });
};

// ==========================================
// ENGINEERING DNA IMAGE BACKGROUND
// ==========================================
const setEngineeringBackground = () => {
    const engineeringImage = document.getElementById('engineering-image');

    if (engineeringImage) {
        // Create structural pattern
        engineeringImage.style.background = 'linear-gradient(135deg, #1a2f4b 0%, #2E3E5B 100%)';

        const pattern = document.createElement('div');
        pattern.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
                repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(204, 148, 97, 0.15) 35px, rgba(204, 148, 97, 0.15) 36px),
                repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(204, 148, 97, 0.15) 35px, rgba(204, 148, 97, 0.15) 36px);
        `;
        engineeringImage.appendChild(pattern);
    }
};

// ==========================================
// COUNTER ANIMATION FOR DNA FEATURES
// ==========================================
const animateCounters = () => {
    const counters = document.querySelectorAll('.feature-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = target.textContent;

                // Only animate numbers
                if (finalValue.match(/\d+/)) {
                    const number = parseInt(finalValue.match(/\d+/)[0]);
                    const suffix = finalValue.replace(/\d+/, '');
                    let current = 0;
                    const increment = number / 50;
                    const duration = 2000;
                    const stepTime = duration / 50;

                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= number) {
                            target.textContent = number + suffix;
                            clearInterval(timer);
                        } else {
                            target.textContent = Math.floor(current) + suffix;
                        }
                    }, stepTime);

                    observer.unobserve(target);
                }
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    animateOnScroll();
    setPortfolioBackgrounds();
    setEngineeringBackground();
    animateCounters();

    // Add a subtle entrance animation to the page
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ==========================================
// PERFORMANCE: DEBOUNCE SCROLL EVENTS
// ==========================================
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
    }

    scrollTimeout = window.requestAnimationFrame(() => {
        // Scroll-dependent animations run here
        // Already handled by individual scroll listeners above
    });
}, { passive: true });


// ==========================================
// MODAL FUNCTIONALITY FOR PORTFOLIO CARDS
// ==========================================
const initModals = () => {
    const portfolioItems = document.querySelectorAll('.portfolio-item[data-modal]');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.modal-close');

    // Open modal when clicking portfolio item
    portfolioItems.forEach(item => {
        item.addEventListener('click', () => {
            const modalId = item.getAttribute('data-modal');
            const modal = document.getElementById(`modal-${modalId}`);

            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent background scroll
            }
        });
    });

    // Close modal when clicking close button
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const modal = button.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = ''; // Restore scroll
            }
        });
    });

    // Close modal when clicking outside the content
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Close modal with ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.classList.contains('active')) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
    });
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    animateOnScroll();
    setPortfolioBackgrounds();
    setEngineeringBackground();
    animateCounters();
    initModals();
    initLoader(); // Initialize loader

    // Dynamic Year Update
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Add a subtle entrance animation to the page (Original opacity logic removed as loader handles it)
    // document.body.style.opacity = '0';
    // setTimeout(() => {
    //     document.body.style.transition = 'opacity 0.5s ease';
    //     document.body.style.opacity = '1';
    // }, 100);
    // Custom Cursor Logic - Only for Desktop
    const cursor = document.querySelector('.custom-cursor');
    const cursorOutline = document.querySelector('.custom-cursor-outline');

    if (cursor && cursorOutline && window.innerWidth > 1024) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';

            // Smoother outline follow
            cursorOutline.animate({
                left: `${e.clientX}px`,
                top: `${e.clientY}px`
            }, { duration: 500, fill: "forwards" });
        });

        // Hover Effect
        const hoverElements = document.querySelectorAll('a, button, .portfolio-item, .service-card, .tech-feature, .hamburger');

        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
                cursorOutline.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
                cursorOutline.classList.remove('hover');
            });
        });
    }

    // ==========================================
    // LANGUAGE SWITCHER LOGIC (CLICK BASED FOR MOBILE)
    // ==========================================
    const langItems = document.querySelectorAll('.lang-dropdown li');
    const activeLangText = document.getElementById('active-lang');

    // Toggle dropdown on click (Robust for Mobile)
    if (langCurrent) {
        langCurrent.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isActive = langSelector.classList.contains('active');

            // Close other menus if needed
            if (!isActive) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }

            if (isActive) {
                langSelector.classList.remove('active');
            } else {
                langSelector.classList.add('active');
            }
        });
    }

    // Close dropdown when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (langSelector && langSelector.classList.contains('active')) {
            if (!langSelector.contains(e.target)) {
                langSelector.classList.remove('active');
            }
        }
    });

    const updateContent = (lang) => {
        const langData = translations[lang];
        if (!langData) return;

        // Update direction
        document.documentElement.dir = langData.dir;
        document.documentElement.lang = lang;

        // Update all elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (langData[key]) {
                if (langData[key].includes('<')) {
                    el.innerHTML = langData[key];
                } else {
                    el.textContent = langData[key];
                }
            }
        });

        // Re-inject the current year
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }

        // Update active language text in navbar
        activeLangText.textContent = lang.toUpperCase();

        // Save preference
        localStorage.setItem('ibe_lang', lang);
    };

    langItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const selectedLang = item.getAttribute('data-lang');
            updateContent(selectedLang);
            if (langSelector) langSelector.classList.remove('active');
        });
    });

    // Default to French
    const savedLang = localStorage.getItem('ibe_lang') || 'fr';
    updateContent(savedLang);

    // FLOATING CTA SCROLL LOGIC
    // ==========================================
    const floatingCta = document.querySelector('.floating-cta');
    if (floatingCta) {
        // Show immediately on page load
        floatingCta.classList.add('visible');
    }

    // ==========================================
    // SMOOTH SCROLLING (LENIS)
    // ==========================================
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // ==========================================
    // GSAP ANIMATIONS WITH SCROLLTRIGGER
    // ==========================================
    gsap.registerPlugin(ScrollTrigger);

    // Connect GSAP ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Parallax effect on DNA image (Subtle)
    gsap.to('.dna-image', {
        scrollTrigger: {
            trigger: '.engineering-dna',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
        },
        y: -30,
        ease: 'none'
    });

    // Parallax on hero background (if exists)
    const heroBg = document.querySelector('.bg-slideshow');
    if (heroBg) {
        gsap.to(heroBg, {
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1,
            },
            y: 100,
            ease: 'none'
        });
    }
});

// ==========================================
// LOADER ANIMATION
// ==========================================
const initLoader = () => {
    const loader = document.getElementById('loader');

    // Auto-open loader after a short delay or window load
    const openLoader = () => {
        setTimeout(() => {
            loader.classList.remove('loading');
            loader.classList.add('loaded');

            // Re-enable scroll
            document.body.style.overflow = '';
        }, 1500); // 1.5s delay for branding visibility
    };

    if (document.readyState === 'complete') {
        openLoader();
    } else {
        window.addEventListener('load', openLoader);
        setTimeout(openLoader, 3000); // Fallback
    }
};

