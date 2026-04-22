document.addEventListener('DOMContentLoaded', () => {

  const loader = document.getElementById('loader');
  document.body.classList.add('loading');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.remove('loading');
    }, 1800);
  });

  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const navOverlay = document.getElementById('navOverlay');
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.header__nav-link');

  const closeMenu = () => {
    nav.classList.remove('open');
    burger.classList.remove('active');
    navOverlay.classList.remove('active');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    burger.classList.toggle('active');
    navOverlay.classList.toggle('active');
    burger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navOverlay.addEventListener('click', closeMenu);
  navLinks.forEach(link => link.addEventListener('click', closeMenu));

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  const carouselEl = document.querySelector('.carousel');
  const track = document.getElementById('carouselTrack');
  const origSlides = Array.from(track.querySelectorAll('.carousel__slide'));
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');
  const progressBar = document.getElementById('carouselProgress');
  const totalReal = origSlides.length;
  const slideGap = 16;
  const cloneCount = 2;
  let autoPlayInterval;
  let isTransitioning = false;

  for (let i = 0; i < cloneCount; i++) {
    const cloneLast = origSlides[totalReal - 1 - i].cloneNode(true);
    cloneLast.classList.add('carousel__clone');
    cloneLast.setAttribute('aria-hidden', 'true');
    track.insertBefore(cloneLast, track.firstChild);
  }
  for (let i = 0; i < cloneCount; i++) {
    const cloneFirst = origSlides[i].cloneNode(true);
    cloneFirst.classList.add('carousel__clone');
    cloneFirst.setAttribute('aria-hidden', 'true');
    track.appendChild(cloneFirst);
  }

  const allSlides = track.querySelectorAll('.carousel__slide');
  let currentIndex = cloneCount;

  const sizeSlides = () => {
    const containerW = carouselEl.offsetWidth;
    const isMobile = window.innerWidth < 768;
    const slideW = isMobile ? containerW * 0.78 : containerW * 0.6;
    allSlides.forEach(s => {
      s.style.width = slideW + 'px';
      s.style.flexShrink = '0';
    });
  };

  sizeSlides();
  window.addEventListener('resize', () => {
    sizeSlides();
    positionTrack(false);
  });

  origSlides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('carousel__dot');
    if (i === 0) dot.classList.add('active');
    dot.setAttribute('aria-label', 'Ir a slide ' + (i + 1));
    dot.addEventListener('click', () => {
      goToSlide(i + cloneCount);
      resetAutoPlay();
    });
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.carousel__dot');

  function positionTrack(animate) {
    const slideW = allSlides[0].offsetWidth;
    const containerW = carouselEl.offsetWidth;
    const centerOffset = (containerW - slideW) / 2;
    const offset = currentIndex * (slideW + slideGap) - centerOffset;

    track.style.transition = animate ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
    track.style.transform = 'translateX(-' + offset + 'px)';

    allSlides.forEach((s, i) => {
      s.classList.toggle('active', i === currentIndex);
    });

    const realIndex = (currentIndex - cloneCount + totalReal) % totalReal;
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === realIndex);
    });
    if (progressBar) {
      progressBar.style.width = ((realIndex + 1) / totalReal * 100) + '%';
    }
  }

  function goToSlide(index) {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex = index;
    positionTrack(true);
  }

  track.addEventListener('transitionend', () => {
    isTransitioning = false;
    if (currentIndex >= totalReal + cloneCount) {
      currentIndex = cloneCount;
      positionTrack(false);
    } else if (currentIndex < cloneCount) {
      currentIndex = totalReal + cloneCount - 1;
      positionTrack(false);
    }
  });

  positionTrack(false);

  prevBtn.addEventListener('click', () => {
    goToSlide(currentIndex - 1);
    resetAutoPlay();
  });

  nextBtn.addEventListener('click', () => {
    goToSlide(currentIndex + 1);
    resetAutoPlay();
  });

  function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 4500);
  }

  function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
  }

  startAutoPlay();

  carouselEl.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
  carouselEl.addEventListener('mouseleave', startAutoPlay);

  let touchStartX = 0;
  carouselEl.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    clearInterval(autoPlayInterval);
  }, { passive: true });

  carouselEl.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      goToSlide(diff > 0 ? currentIndex + 1 : currentIndex - 1);
    }
    startAutoPlay();
  }, { passive: true });

  const reveals = document.querySelectorAll('.reveal, .reveal-up');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute('data-delay');
        const ms = delay ? parseInt(delay) * 120 : 0;
        setTimeout(() => entry.target.classList.add('visible'), ms);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));

  const statNumbers = document.querySelectorAll('.about__stat-number');
  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'));
        animateNumber(el, target);
        statsObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => statsObserver.observe(el));

  function animateNumber(el, target) {
    const duration = 1500;
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current >= 1000 ? current.toLocaleString('es-AR') : current;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target >= 1000 ? target.toLocaleString('es-AR') : target;
      }
    }
    requestAnimationFrame(step);
  }

  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 600) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  const form = document.querySelector('.contact__form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.btn');
      const originalText = btn.textContent;
      btn.textContent = 'Enviado';
      btn.style.background = 'var(--green-matcha)';
      btn.style.borderColor = 'var(--green-matcha)';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.borderColor = '';
        form.reset();
      }, 2500);
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = header.offsetHeight + 10;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});
