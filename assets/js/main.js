/* SFS – interactions communes aux pages du site */
(function () {
  'use strict';

  // Masque proprement les images absentes (le fond dégradé de .media prend le relais)
  document.querySelectorAll('.media img').forEach(function (img) {
    function markMissing() { img.classList.add('is-missing'); }
    if (img.complete && img.naturalWidth === 0) markMissing();
    img.addEventListener('error', markMissing);
  });

  // Menu mobile
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  // En-tête ombré + bouton retour en haut
  var header = document.getElementById('header');
  var toTop = document.getElementById('toTop');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 10);
    toTop.classList.toggle('is-visible', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // Diaporama du hero (page d'accueil)
  var slides = document.querySelectorAll('.hero__slide');
  if (slides.length) {
    var current = 0;
    var timer;
    function show(index) {
      slides[current].classList.remove('is-active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('is-active');
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(function () { show(current + 1); }, 6000);
    }
    document.querySelector('.hero__arrow--prev').addEventListener('click', function () { show(current - 1); restart(); });
    document.querySelector('.hero__arrow--next').addEventListener('click', function () { show(current + 1); restart(); });
    restart();
  }

  // Logos partenaires : nom en secours si le logo est absent, puis défilement en boucle
  var track = document.getElementById('partnersTrack');
  if (track) {
    // Duplique la liste pour que l'animation (translateX -50 %) boucle sans coupure
    Array.prototype.slice.call(track.children).forEach(function (item) {
      var clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelector('img').alt = '';
      track.appendChild(clone);
    });
    track.querySelectorAll('.partner img').forEach(function (img) {
      var item = img.closest('.partner');
      function markMissing() { item.classList.add('is-missing'); }
      if (img.complete && img.naturalWidth === 0) markMissing();
      img.addEventListener('error', markMissing);
    });
  }

  // Apparition des sections au défilement
  var targets = document.querySelectorAll('.section-head, .card, .why__item, .sector, .step, .about__grid > *, .vmv__card, .legal__grid > *, .leader__grid > *, .purpose__text, .purpose__cards li');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }

  // Année du copyright
  document.getElementById('year').textContent = new Date().getFullYear();
})();
