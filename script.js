document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. AUDIO LAYER (SPA ROUTER SAFE)
  // ==========================================
  const audio =
    document.getElementById("bg-music") ||
    (() => {
      const a = document.createElement("audio");
      a.id = "bg-music";
      a.loop = true;
      a.innerHTML = `<source src="asset/rumah.mp3" type="audio/mpeg">`;
      document.body.appendChild(a);
      return a;
    })();

  const musicBtn = document.getElementById("music-btn");
  if (musicBtn) {
    audio.volume = 0.6;

    const triggerAudio = () => {
      if (audio.paused && sessionStorage.getItem("music_playing") !== "false") {
        audio
          .play()
          .then(() => {
            sessionStorage.setItem("music_playing", "true");
            musicBtn.classList.add("playing");
          })
          .catch(() => {});
      }
      document.removeEventListener("click", triggerAudio);
      document.removeEventListener("touchstart", triggerAudio);
    };
    document.addEventListener("click", triggerAudio);
    document.addEventListener("touchstart", triggerAudio);

    musicBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (audio.paused) {
        audio.play();
        sessionStorage.setItem("music_playing", "true");
        musicBtn.classList.add("playing");
      } else {
        audio.pause();
        sessionStorage.setItem("music_playing", "false");
        musicBtn.classList.remove("playing");
      }
    });

    if (sessionStorage.getItem("music_playing") === "true" && !audio.paused) {
      musicBtn.classList.add("playing");
    }
  }

  // ==========================================
  // 2. INTERACTIVE COMPONENT INITIALIZER
  // ==========================================
  const bindInteractions = () => {
    // A. SCROLL REVEAL MANAGEMENT
    const revealElements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    revealElements.forEach((el) => observer.observe(el));

    // B. GALLERY: FULLSCREEN MODAL POLAROID
    const bricks = document.querySelectorAll(".brick-node");
    const modal = document.getElementById("polaroid-modal");

    if (modal) {
      const modalImg = document.getElementById("modal-img");
      const modalCaption = document.getElementById("modal-caption");
      const closeBtn = document.getElementById("modal-close-btn");
      const closeBg = document.getElementById("modal-close-bg");

      // Open Modal
      bricks.forEach((brick) => {
        brick.addEventListener("click", function () {
          const imgSrc = this.getAttribute("data-src");
          const captionTxt = this.getAttribute("data-caption");

          modalImg.src = imgSrc;
          modalCaption.textContent = captionTxt;
          modal.classList.remove("hidden");
        });
      });

      // Close Modal Function
      const closeModal = () => {
        modal.classList.add("hidden");
        setTimeout(() => {
          modalImg.src = "";
        }, 400); // Clear image after transition
      };

      closeBtn.addEventListener("click", closeModal);
      closeBg.addEventListener("click", closeModal);
    }

    // C. BIRTHDAY CANDLE ENGINE (birthday.html)
    const mainCandle = document.getElementById("main-candle");
    const revealCandle = document.getElementById("reveal-candle");

    if (mainCandle || revealCandle) {
      const darkRoom = document.getElementById("dark-room");
      const letterSection = document.getElementById("letter-section");
      const mainContainer = document.getElementById("main-bday-container");
      const backNavButton = document.getElementById("bday-back-link");
      const wishesSection = document.getElementById("wishes-section");

      // 1. Lilin Utama -> Membuka Surat Terang
      if (mainCandle) {
        mainCandle.addEventListener("click", () => {
          const flame = document.getElementById("main-candle-flame");
          if (!flame.classList.contains("hidden")) return;
          flame.classList.remove("hidden"); // Nyalakan api

          setTimeout(() => {
            if (darkRoom) darkRoom.style.opacity = "0";
            if (mainContainer) mainContainer.classList.add("lit-up");
            if (backNavButton)
              backNavButton.classList.remove("dark-mode-back-pill");

            setTimeout(() => {
              if (darkRoom) darkRoom.style.display = "none";
              if (letterSection) letterSection.classList.remove("hidden");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }, 1000);
          }, 1000);
        });
      }

      // 2. Lilin Kedua (Bawah Surat) -> Membuka Gulungan Harapan
      if (revealCandle && wishesSection) {
        revealCandle.addEventListener("click", () => {
          const flame = document.getElementById("reveal-candle-flame");
          if (!flame.classList.contains("hidden")) return;
          flame.classList.remove("hidden"); // Nyalakan api

          // Munculkan section harapan
          wishesSection.classList.add("revealed");

          // Auto-scroll ke bagian harapan perlahan
          setTimeout(() => {
            wishesSection.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 600);
        });
      }

      // 3. Logika Membuka Surat Gulung Interaktif
      const rolledLetters = document.querySelectorAll(".rolled-letter");
      rolledLetters.forEach((letter) => {
        letter.addEventListener("click", function () {
          // Toggle class open untuk animasi CSS
          this.classList.toggle("open");
        });
      });
    }

    // D. TOUCH TO LIGHT BOX MASK (birthday.html)
    const secretMask = document.getElementById("secret-touch-area");
    if (secretMask) {
      const cover = document.getElementById("secret-mask");
      secretMask.addEventListener("click", () => {
        if (cover) cover.classList.add("extinguished");
      });
    }
  };

  bindInteractions();

  // ==========================================
  // 3. SEAMLESS SPA TRANSITION ENGINE
  // ==========================================
  const handleRouting = async (targetUrl) => {
    const overlay = document.getElementById("page-transition");
    if (overlay) overlay.classList.add("active");

    try {
      const response = await fetch(targetUrl);
      const htmlMarkup = await response.text();
      const domParser = new DOMParser();
      const dynamicDoc = domParser.parseFromString(htmlMarkup, "text/html");

      setTimeout(() => {
        document.title = dynamicDoc.title;
        const currentWrapper = document.getElementById("app-content");
        const freshContent = dynamicDoc.getElementById("app-content");

        if (currentWrapper && freshContent) {
          currentWrapper.innerHTML = freshContent.innerHTML;
          // Re-append the modal explicitly to the body context if we are on gallery
          if (document.getElementById("polaroid-modal")) {
            document.body.appendChild(
              document.getElementById("polaroid-modal"),
            );
          }
        }

        history.pushState(null, "", targetUrl);
        window.scrollTo({ top: 0, behavior: "auto" });

        bindInteractions();
        if (overlay) overlay.classList.remove("active");
      }, 500);
    } catch (error) {
      window.location.href = targetUrl;
    }
  };

  document.body.addEventListener("click", (e) => {
    const navLink = e.target.closest("a[data-nav]");
    if (navLink) {
      e.preventDefault();
      handleRouting(navLink.href);
    }
  });

  window.addEventListener("popstate", () =>
    handleRouting(window.location.href),
  );
});
