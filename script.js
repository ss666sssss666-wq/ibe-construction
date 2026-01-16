// ==========================================
// NAVIGATION SCROLL EFFECT
// ==========================================
const nav = document.querySelector('.nav-glass');
const navLinks = document.querySelector('.nav-links');
const hamburger = document.querySelector('.hamburger');

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// ==========================================
// MOBILE MENU TOGGLE
// ==========================================
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
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
// FORM HANDLING
// ==========================================
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        message: document.getElementById('message').value
    };

    // Simulate form submission
    console.log('Form submitted:', formData);

    // Show success message
    const submitBtn = contactForm.querySelector('.cta-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Message Envoyé ✓';
    submitBtn.style.background = '#27ae60';
    submitBtn.style.borderColor = '#27ae60';

    // Reset form
    setTimeout(() => {
        contactForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
        submitBtn.style.borderColor = '';
    }, 3000);
});

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
// PARALLAX EFFECT ON HERO
// ==========================================
const hero = document.querySelector('.hero');
const blueprintGraphic = document.querySelector('.blueprint-graphic');

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroBottom = hero.offsetTop + hero.offsetHeight;

    if (scrolled < heroBottom) {
        if (blueprintGraphic) {
            blueprintGraphic.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    }
});

// ==========================================
// DYNAMIC BACKGROUND FOR PORTFOLIO IMAGES
// ==========================================
const setPortfolioBackgrounds = () => {
    const portfolioImages = document.querySelectorAll('.portfolio-image');

    portfolioImages.forEach((img, index) => {
        // Create a subtle pattern for each portfolio item
        const gradients = [
            'linear-gradient(135deg, #1B263B 0%, #2E3E5B 50%, #1B263B 100%)',
            'linear-gradient(135deg, #2E3E5B 0%, #1B263B 50%, #2E3E5B 100%)',
            'linear-gradient(135deg, #1B263B 0%, #3A4A6B 50%, #2E3E5B 100%)',
            'linear-gradient(135deg, #2E3E5B 0%, #3A4A6B 50%, #1B263B 100%)'
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
                linear-gradient(45deg, transparent 48%, rgba(217, 72, 15, 0.1) 49%, rgba(217, 72, 15, 0.1) 51%, transparent 52%),
                linear-gradient(-45deg, transparent 48%, rgba(217, 72, 15, 0.1) 49%, rgba(217, 72, 15, 0.1) 51%, transparent 52%);
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
        engineeringImage.style.background = 'linear-gradient(135deg, #1B263B 0%, #2E3E5B 100%)';

        const pattern = document.createElement('div');
        pattern.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
                repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(217, 72, 15, 0.15) 35px, rgba(217, 72, 15, 0.15) 36px),
                repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(217, 72, 15, 0.15) 35px, rgba(217, 72, 15, 0.15) 36px);
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
