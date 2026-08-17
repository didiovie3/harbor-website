// ===== Harbor Holdings Master Site Script =====

document.addEventListener("DOMContentLoaded", () => {

  /**
   * 1. Page Loader Fade & Cleanup
   */
  const loader = document.getElementById("pageLoader");
  if (loader) {
    // Fade out after page load finishes
    window.addEventListener("load", () => {
      setTimeout(() => {
        loader.style.opacity = "0";
        loader.style.pointerEvents = "none";
        // Fully remove from document layout after transition finishes
        loader.addEventListener("transitionend", () => {
          loader.style.display = "none";
        }, { once: true });
      }, 500);
    });

    // Fallback: hide loader if load event takes too long (e.g. slow resources)
    setTimeout(() => {
      if (loader.style.display !== "none") {
        loader.style.opacity = "0";
        loader.style.pointerEvents = "none";
        setTimeout(() => {
          loader.style.display = "none";
        }, 400);
      }
    }, 3000);
  }

  /**
   * 2. Header Scroll Effect
   */
  const header = document.querySelector(".site-header");
  const handleScroll = () => {
    if (window.scrollY > 20) {
      header?.classList.add("scrolled");
    } else {
      header?.classList.remove("scrolled");
    }
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  /**
   * 3. Accessible Mobile Navigation Menu
   */
  const menuToggle = document.getElementById("menuToggle");
  const navDrawer = document.getElementById("navDrawer");
  const drawerOverlay = document.getElementById("drawerOverlay");
  const drawerLinks = document.querySelectorAll(".drawer-link");

  const openDrawer = () => {
    menuToggle?.setAttribute("aria-expanded", "true");
    navDrawer?.classList.add("open");
    drawerOverlay?.classList.add("visible");
    document.body.style.overflow = "hidden"; // Prevent background scroll
    // Set focus to the first link in drawer
    if (drawerLinks.length > 0) {
      setTimeout(() => drawerLinks[0].focus(), 100);
    }
  };

  const closeDrawer = () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    navDrawer?.classList.remove("open");
    drawerOverlay?.classList.remove("visible");
    document.body.style.overflow = ""; // Re-enable scroll
    menuToggle?.focus();
  };

  menuToggle?.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  drawerOverlay?.addEventListener("click", closeDrawer);

  // Close drawer on ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navDrawer?.classList.contains("open")) {
      closeDrawer();
    }
  });

  // Close drawer when links inside are clicked (useful for anchors)
  drawerLinks.forEach(link => {
    link.addEventListener("click", closeDrawer);
  });

  /**
   * 4. Dynamic Copyright Year
   */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /**
   * 5. Scroll Reveal Animations (Intersection Observer)
   */
  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // Trigger once
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach(el => el.classList.add("visible"));
  }

  /**
   * 6. Universal Form Validation & Async Submission
   */
  const contactForms = document.querySelectorAll("form");
  
  contactForms.forEach(form => {
    const statusEl = form.querySelector(".form-status") || document.getElementById("formStatus");
    
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      // Perform HTML5 Validation check
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Check for privacy consent checkbox if it exists on form
      const consentCheckbox = form.querySelector('input[name="consent"]');
      if (consentCheckbox && !consentCheckbox.checked) {
        if (statusEl) {
          statusEl.textContent = "Please agree to the privacy policy before submitting.";
          statusEl.className = "form-status error";
          statusEl.style.display = "block";
        }
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : "Submit";
      
      // Visual feedback
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }

      if (statusEl) {
        statusEl.textContent = "Sending your message. Please wait...";
        statusEl.className = "form-status";
        statusEl.style.display = "block";
      }

      try {
        const formData = new FormData(form);
        const actionUrl = form.getAttribute("action") || "https://formspree.io/f/mzzbdlwj";
        const method = form.getAttribute("method") || "POST";

        const response = await fetch(actionUrl, {
          method: method,
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          form.reset();
          if (statusEl) {
            statusEl.textContent = "Thank you! Your message has been sent successfully. We will get back to you shortly.";
            statusEl.className = "form-status success";
          }
        } else {
          throw new Error("Form submission response error");
        }
      } catch (error) {
        console.error("Form error:", error);
        if (statusEl) {
          statusEl.textContent = "An error occurred while sending your message. Please try again or contact us directly.";
          statusEl.className = "form-status error";
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }
    });
  });

});
