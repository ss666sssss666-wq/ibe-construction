// ==========================================================================
// IBE Construction - Scripts pour Pages Piliers & Services
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Navigation Scroll Effect
  const nav = document.querySelector(".nav-glass");
  const updateNav = () => {
    if (!nav) return;
    if (window.scrollY > 40) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  };
  window.addEventListener("scroll", updateNav, { passive: true });
  updateNav();

  // 2. Mobile Menu Toggle
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      hamburger.classList.toggle("active");
    });

    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        hamburger.classList.remove("active");
      });
    });
  }

  // 3. Language Selector Toggle
  const langCurrent = document.querySelector(".lang-current");
  const langSelector = document.querySelector(".lang-selector");
  if (langCurrent && langSelector) {
    langCurrent.addEventListener("click", (e) => {
      e.stopPropagation();
      langSelector.classList.toggle("active");
    });
    document.addEventListener("click", (e) => {
      if (!langSelector.contains(e.target)) {
        langSelector.classList.remove("active");
      }
    });
  }

  // 4. Custom Architectural Cursor (Identique au site principal)
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
        { duration: 400, fill: "forwards" }
      );
    });

    const hoverTargets = document.querySelectorAll(
      "a, button, .feature-box-seo, .step-card, .other-service-link, .faq-question-seo, .hamburger, .lang-current, input, textarea, select"
    );

    hoverTargets.forEach((el) => {
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

  // 5. FAQ Accordion
  const faqQuestions = document.querySelectorAll(".faq-question-seo");
  faqQuestions.forEach((q) => {
    q.addEventListener("click", () => {
      const item = q.parentElement;
      const isOpen = item.classList.contains("active");
      
      // Close all other FAQs
      document.querySelectorAll(".faq-item-seo").forEach((i) => {
        i.classList.remove("active");
        const icon = i.querySelector(".fa-chevron-down");
        if (icon) icon.style.transform = "rotate(0deg)";
        const ans = i.querySelector(".faq-answer-seo");
        if (ans) ans.style.display = "none";
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add("active");
        const icon = q.querySelector(".fa-chevron-down");
        if (icon) icon.style.transform = "rotate(180deg)";
        const ans = item.querySelector(".faq-answer-seo");
        if (ans) ans.style.display = "block";
      }
    });
  });
});
