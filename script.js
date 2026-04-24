// ==========================================
// NAVIGATION SCROLL EFFECT (OPTIMIZED)
// ==========================================
const nav = document.querySelector(".nav-glass");
const navLinks = document.querySelector(".nav-links");
const hamburger = document.querySelector(".hamburger");
const langSelector = document.querySelector(".lang-selector");
const langCurrent = document.querySelector(".lang-current");

let navTicking = false;
let lastScrollY = 0;

const updateNavOnScroll = () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY > 100) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }

  lastScrollY = currentScrollY;
  navTicking = false;
};

window.addEventListener(
  "scroll",
  () => {
    if (!navTicking) {
      window.requestAnimationFrame(updateNavOnScroll);
      navTicking = true;
    }
  },
  { passive: true },
);

// ==========================================
// MOBILE MENU TOGGLE
// ==========================================
hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  hamburger.classList.toggle("active");
  // Close language dropdown if opening menu
  if (langSelector) langSelector.classList.remove("active");
});

// Close menu when clicking a link
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
    hamburger.classList.remove("active");
  });
});

// ==========================================
// SMOOTH SCROLL WITH OFFSET
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    if (targetId === "#") return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const navHeight = nav.offsetHeight;
      const targetPosition = targetElement.offsetTop - navHeight - 20;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
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
    rootMargin: "0px 0px -100px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("aos-animate");
      }
    });
  }, observerOptions);

  // Observe all elements with data-aos attribute
  document.querySelectorAll("[data-aos]").forEach((el) => {
    observer.observe(el);

    // Add delay if specified
    const delay = el.getAttribute("data-delay");
    if (delay) {
      el.style.transitionDelay = `${delay}ms`;
    }
  });
};

// ==========================================
// AJAX FORM HANDLING
// ==========================================
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    // Prevent default submission to stay on page (AJAX)
    e.preventDefault();

    const submitBtn = contactForm.querySelector(".cta-btn");
    const originalText = submitBtn.textContent;

    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = "Envoi en cours...";
    submitBtn.style.opacity = "0.7";

    const formData = new FormData(contactForm);

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        // Show success message on button
        submitBtn.textContent = "Message Envoyé ✓";
        submitBtn.style.background = "#27ae60";
        submitBtn.style.borderColor = "#27ae60";
        submitBtn.style.color = "#ffffff";
        submitBtn.style.opacity = "1";

        // Reset form
        contactForm.reset();

        // Clear any "has-value" classes from floating labels
        const inputs = contactForm.querySelectorAll("input, textarea");
        inputs.forEach((input) => input.classList.remove("has-value"));

        // Show toast notification
        showToast("✅ Votre message a bien été envoyé !", "success");

        // Marketing Tracking: Lead Conversion
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "lead_form_submitted",
          form_name: "contact_footer",
          service: formData.get("service") || "general",
        });

        if (typeof fbq === "function") {
          fbq("track", "Lead");
        }

        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.style.background = "";
          submitBtn.style.borderColor = "";
          submitBtn.style.color = "";
          submitBtn.disabled = false;
        }, 5000);
      } else {
        throw new Error("Erreur lors de l'envoi");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      submitBtn.textContent = "Erreur - Réessayez";
      submitBtn.style.background = "#e74c3c";
      submitBtn.style.borderColor = "#e74c3c";
      submitBtn.style.color = "#ffffff";
      submitBtn.style.opacity = "1";

      showToast("❌ Erreur lors de l'envoi du message", "error");

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.background = "";
        submitBtn.style.borderColor = "";
        submitBtn.style.color = "";
        submitBtn.disabled = false;
      }, 3000);
    }
  });
}

// Helper function for Toast notifications
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  const bgColor = type === "success" ? "#27ae60" : "#e74c3c";

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
    toast.style.transform = "translateY(0)";
  }, 100);

  // Remove after 5s
  setTimeout(() => {
    toast.style.transform = "translateY(-100px)";
    setTimeout(() => toast.remove(), 500);
  }, 5000);
}

// ==========================================
// FLOATING LABELS FOR FORM INPUTS
// ==========================================
const formInputs = document.querySelectorAll(
  ".form-group input, .form-group textarea",
);

formInputs.forEach((input) => {
  // Check on page load if input has value
  if (input.value) {
    input.classList.add("has-value");
  }

  // Add/remove class on input
  input.addEventListener("input", () => {
    if (input.value) {
      input.classList.add("has-value");
    } else {
      input.classList.remove("has-value");
    }
  });
});

// ==========================================
// PARALLAX EFFECT ON HERO (OPTIMIZED)
// ==========================================
const hero = document.querySelector(".hero");
const blueprintGraphic = document.querySelector(".blueprint-graphic");

let parallaxTicking = false;

const updateParallax = () => {
  const scrolled = window.pageYOffset;
  const heroBottom = hero.offsetTop + hero.offsetHeight;

  if (scrolled < heroBottom && blueprintGraphic) {
    blueprintGraphic.style.transform = `translateY(${scrolled * 0.3}px)`;
  }

  parallaxTicking = false;
};

window.addEventListener(
  "scroll",
  () => {
    if (!parallaxTicking) {
      window.requestAnimationFrame(updateParallax);
      parallaxTicking = true;
    }
  },
  { passive: true },
);

// ==========================================
// COUNTER ANIMATION FOR DNA FEATURES
// ==========================================
function animateCounters() {
  // Select all potential counters
  const counterElements = document.querySelectorAll(
    ".stat-number, .pillar-number",
  );

  counterElements.forEach((el) => {
    const targetValue =
      parseInt(el.getAttribute("data-target")) ||
      parseInt(el.textContent.match(/\d+/));
    if (isNaN(targetValue)) return;

    const prefix = el.getAttribute("data-prefix") || "";
    const suffix = el.getAttribute("data-suffix") || "";
    const isPillar = el.classList.contains("pillar-number");

    // Initial state
    el.textContent =
      isPillar && targetValue < 10
        ? `${prefix}00${suffix}`
        : `${prefix}0${suffix}`;

    gsap.to(el, {
      scrollTrigger: {
        trigger: el,
        start: "top 90%", // Start when bottom of element hits 90% of viewport
        toggleActions: "play none none none", // Play once
      },
      duration: 2,
      innerHTML: targetValue,
      snap: { innerHTML: 1 }, // Ensure integers
      ease: "power2.out",
      onUpdate: function () {
        let val = Math.floor(this.targets()[0].innerHTML);
        let displayVal = val;
        if (isPillar && val < 10) {
          displayVal = `0${val}`;
        }
        el.textContent = `${prefix}${displayVal}${suffix}`;
      },
    });
  });
}

// ==========================================
// RADAR CHART PERFORMANCE ANIMATION
// ==========================================
function initRadarChart() {
  const radarArea = document.querySelector(".radar-area");
  if (!radarArea) return;

  const finalPoints = "200,53 335,156 288,321 125,303 69,157";

  gsap.to(radarArea, {
    scrollTrigger: {
      trigger: ".startup-vision",
      start: "top 60%",
      toggleActions: "play none none reverse",
    },
    attr: { points: finalPoints },
    duration: 1.5,
    ease: "power2.out"
  });

  // Animate Performance Bars
  const perfBars = document.querySelectorAll(".perf-bar-fill");
  perfBars.forEach((bar) => {
    const targetWidth = bar.getAttribute("data-width");
    gsap.to(bar, {
      scrollTrigger: {
        trigger: ".startup-vision",
        start: "top 60%",
        toggleActions: "play none none reverse",
      },
      width: targetWidth,
      duration: 1.5,
      delay: 0.5,
      ease: "power2.out",
    });
  });
}

// ==========================================
// ==========================================
// INITIALIZATION & CORE LOGIC
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Basic UI Layout
  animateOnScroll();
  initRadarChart();
  initLoader();

  // update year
  const yearSpan = document.getElementById("current-year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // 2. Modals & Filters
  const initModals = () => {
    const portfolioItems = document.querySelectorAll(
      ".portfolio-item[data-modal]",
    );
    const modals = document.querySelectorAll(".modal");
    const closeBtn = document.querySelectorAll(".modal-close");

    portfolioItems.forEach((item) => {
      item.addEventListener("click", () => {
        const modalId = item.getAttribute("data-modal");
        const modal = document.getElementById(`modal-${modalId}`);
        if (modal) {
          modal.classList.add("active");
          document.body.style.overflow = "hidden";
        }
      });
    });

    closeBtn.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const modal = btn.closest(".modal");
        if (modal) {
          modal.classList.remove("active");
          document.body.style.overflow = "";
        }
      });
    });
  };

  const initPortfolioFilters = () => {
    const filterBtns = document.querySelectorAll(".filter-btn");
    const portfolioItems = document.querySelectorAll(".portfolio-item");
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const val = btn.getAttribute("data-filter");
        portfolioItems.forEach((item) => {
          const cat = item.getAttribute("data-modal");
          if (val === "all" || cat === val) {
            item.style.display = "block";
          } else {
            item.style.display = "none";
          }
        });
      });
    });
  };

  initModals();
  initPortfolioFilters();

  // 3. Language Switcher
  const langItems = document.querySelectorAll(".lang-dropdown li");
  const activeLangText = document.getElementById("active-lang");

  const updateContent = (lang) => {
    const langData = translations[lang];
    if (!langData) return;

    document.documentElement.dir = langData.dir || "ltr";
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (langData[key]) {
        if (langData[key].includes("<")) {
          el.innerHTML = langData[key];
        } else {
          el.textContent = langData[key];
        }
      }
    });

    if (activeLangText) activeLangText.textContent = lang.toUpperCase();
    localStorage.setItem("ibe_lang", lang);

    // RE-TRIGGER COUNTERS FOR NEW CONTENT
    setTimeout(animateCounters, 100);
  };

  langItems.forEach((item) => {
    item.addEventListener("click", () => {
      updateContent(item.getAttribute("data-lang"));
      if (langSelector) langSelector.classList.remove("active");
    });
  });

  if (langCurrent && langSelector) {
    langCurrent.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      langSelector.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (!langSelector.contains(e.target)) {
        langSelector.classList.remove("active");
      }
    });
  }

  const savedLang = localStorage.getItem("ibe_lang") || "fr";
  updateContent(savedLang);

  // 4. Smooth Scrolling (Lenis)
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // 5. GSAP & Parallas
  gsap.registerPlugin(ScrollTrigger);
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  gsap.to(".dna-image", {
    scrollTrigger: {
      trigger: ".engineering-dna",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
    y: -30,
    ease: "none",
  });

  // 6. Custom Cursor & Hover Effects
  const cursor = document.querySelector(".custom-cursor");
  const cursorOutline = document.querySelector(".custom-cursor-outline");

  if (cursor && cursorOutline && window.innerWidth > 1024) {
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
      cursorOutline.animate(
        {
          left: `${e.clientX}px`,
          top: `${e.clientY}px`,
        },
        { duration: 500, fill: "forwards" },
      );
    });

    const hoverElements = document.querySelectorAll(
      "a, button, .portfolio-item, .service-card, .tech-feature, .hamburger, .lang-current",
    );
    hoverElements.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("hover");
        cursorOutline.classList.add("hover");
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("hover");
        cursorOutline.classList.remove("hover");
      });
    });
  }

  // Initial Trigger for counters
  animateCounters();
});

// ==========================================
// LOADER ANIMATION
// ==========================================
function initLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;

  const openLoader = () => {
    setTimeout(() => {
      loader.classList.remove("loading");
      loader.classList.add("loaded");
      document.body.style.overflow = "";

      // Show the chatbot almost immediately for better visibility
      const chatbot = document.getElementById("ibe-chatbot");
      if (chatbot) chatbot.classList.add("visible");
    }, 1500);
  };

  if (document.readyState === "complete") {
    openLoader();
  } else {
    window.addEventListener("load", openLoader);
    setTimeout(openLoader, 3000);
  }
}

// ==========================================
// IMAGE MODAL FOR SHOWCASE PHOTOS
// ==========================================
function openImageModal(src) {
  const modal = document.getElementById('imageModal');
  const img = document.getElementById('imageModalImg');
  
  if (modal && img) {
    img.src = src;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
}

function closeImageModal() {
  const modal = document.getElementById('imageModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore background scrolling
  }
}

// Close modal when clicking outside the image
document.addEventListener('DOMContentLoaded', () => {
  const imageModal = document.getElementById('imageModal');
  if (imageModal) {
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal) {
        closeImageModal();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && imageModal.classList.contains('active')) {
        closeImageModal();
      }
    });
  }
});

