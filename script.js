/* ==========================================================================
   KAMPUNG HALAMANKU — SCRIPT.JS
   Semua fitur interaktif website ditulis dengan JavaScript murni (vanilla),
   tanpa library/framework eksternal, tanpa backend, tanpa database.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ------------------------------------------------------------------
     1. ANIMASI LOADING HALAMAN
     Loader disembunyikan begitu seluruh halaman (termasuk gambar) siap.
  ------------------------------------------------------------------ */
  var loader = document.getElementById('page-loader');
  window.addEventListener('load', function () {
    if (loader) {
      loader.classList.add('loaded');
    }
  });
  // Jaga-jaga: jika event 'load' lambat, paksa hilang setelah 2 detik.
  setTimeout(function () {
    if (loader) loader.classList.add('loaded');
  }, 2000);


  /* ------------------------------------------------------------------
     2. NAVBAR STICKY + PERUBAHAN GAYA SAAT SCROLL
  ------------------------------------------------------------------ */
  var navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  handleNavbarScroll();
  window.addEventListener('scroll', handleNavbarScroll);


  /* ------------------------------------------------------------------
     3. HAMBURGER MENU (MOBILE NAVBAR)
  ------------------------------------------------------------------ */
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');

  navToggle.addEventListener('click', function () {
    var isOpen = navMenu.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Tutup menu mobile otomatis saat salah satu link diklik
  document.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      navMenu.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });


  /* ------------------------------------------------------------------
     4. SMOOTH SCROLLING UNTUK SEMUA LINK NAVBAR & FOOTER (#anchor)
     (html { scroll-behavior: smooth } sudah membantu, ini fallback
     tambahan untuk browser lama & offset navbar tetap presisi)
  ------------------------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId.length <= 1) return; // lewati href="#"
      var targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();
      var navHeight = navbar.offsetHeight;
      var targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - navHeight + 1;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });


  /* ------------------------------------------------------------------
     5. ACTIVE NAVIGATION BERDASARKAN SECTION YANG SEDANG TERLIHAT
  ------------------------------------------------------------------ */
  var sections = document.querySelectorAll('main section[id], header#beranda');
  var navLinks = document.querySelectorAll('.nav-link');

  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute('id');
        navLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, {
    rootMargin: '-45% 0px -50% 0px', // section dianggap "aktif" saat berada di tengah layar
    threshold: 0
  });

  document.querySelectorAll('main section[id]').forEach(function (sec) {
    sectionObserver.observe(sec);
  });


  /* ------------------------------------------------------------------
     6. SCROLL REVEAL ANIMATION
     Elemen dengan class .reveal akan muncul halus saat masuk viewport.
  ------------------------------------------------------------------ */
  var revealObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // animasi cukup sekali
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });


  /* ------------------------------------------------------------------
     7. COUNTER STATISTIK (ANIMASI ANGKA) DI SECTION "DATA KAMPUNG"
     Counter berjalan otomatis ketika section terlihat di layar.
  ------------------------------------------------------------------ */
  var statNumbers = document.querySelectorAll('.stat-card__number');
  var countersStarted = false;

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    var duration = 1600; // durasi animasi dalam ms
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      // easing sederhana agar tidak terkesan kaku
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * target);
      el.textContent = current.toLocaleString('id-ID');

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString('id-ID');
      }
    }
    requestAnimationFrame(step);
  }

  if (statNumbers.length > 0) {
    var statSection = document.getElementById('data-kampung');
    var statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !countersStarted) {
          countersStarted = true;
          statNumbers.forEach(animateCounter);
        }
      });
    }, { threshold: 0.4 });

    if (statSection) statObserver.observe(statSection);
  }


  /* ------------------------------------------------------------------
     8. GALERI: LIGHTBOX / MODAL
  ------------------------------------------------------------------ */
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');
  var currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    var item = galleryItems[index];
    var img = item.querySelector('img');
    lightboxImg.src = img.getAttribute('src');
    lightboxImg.alt = img.getAttribute('alt') || '';
    lightboxCaption.textContent = item.getAttribute('data-caption') || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // kunci scroll saat modal terbuka
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function showNext(offset) {
    currentIndex = (currentIndex + offset + galleryItems.length) % galleryItems.length;
    openLightbox(currentIndex);
  }

  galleryItems.forEach(function (item, index) {
    item.addEventListener('click', function () {
      openLightbox(index);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', function () { showNext(-1); });
  if (lightboxNext) lightboxNext.addEventListener('click', function () { showNext(1); });

  // Tutup modal saat klik area gelap di luar gambar
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  // Navigasi lightbox dengan keyboard: Esc, Panah kiri/kanan
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showNext(-1);
    if (e.key === 'ArrowRight') showNext(1);
  });


  /* ------------------------------------------------------------------
     9. TOMBOL KEMBALI KE ATAS
  ------------------------------------------------------------------ */
  var backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 500) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }
  });

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  /* ------------------------------------------------------------------
     10. VALIDASI SEDERHANA FORM KONTAK
     Karena website statis, form ini hanya divalidasi di sisi klien
     dan TIDAK mengirim data ke server mana pun.
  ------------------------------------------------------------------ */
  var contactForm = document.getElementById('contactForm');
  var formSuccess = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var nama = document.getElementById('nama');
      var email = document.getElementById('email');
      var pesan = document.getElementById('pesan');

      var errNama = document.getElementById('err-nama');
      var errEmail = document.getElementById('err-email');
      var errPesan = document.getElementById('err-pesan');

      var isValid = true;

      // Validasi nama
      if (nama.value.trim().length < 3) {
        nama.classList.add('invalid');
        errNama.textContent = 'Nama minimal 3 karakter.';
        isValid = false;
      } else {
        nama.classList.remove('invalid');
        errNama.textContent = '';
      }

      // Validasi email dengan pola sederhana
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.value.trim())) {
        email.classList.add('invalid');
        errEmail.textContent = 'Format email tidak valid.';
        isValid = false;
      } else {
        email.classList.remove('invalid');
        errEmail.textContent = '';
      }

      // Validasi pesan
      if (pesan.value.trim().length < 10) {
        pesan.classList.add('invalid');
        errPesan.textContent = 'Pesan minimal 10 karakter.';
        isValid = false;
      } else {
        pesan.classList.remove('invalid');
        errPesan.textContent = '';
      }

      if (isValid) {
        formSuccess.classList.add('show');
        contactForm.reset();
        setTimeout(function () {
          formSuccess.classList.remove('show');
        }, 5000);
      } else {
        formSuccess.classList.remove('show');
      }
    });
  }


  /* ------------------------------------------------------------------
     11. TAHUN COPYRIGHT OTOMATIS
  ------------------------------------------------------------------ */
  var yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

});
