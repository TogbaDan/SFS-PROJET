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

  // Filtres de la page Réalisations
  var filters = document.getElementById('projectFilters');
  if (filters) {
    var items = document.querySelectorAll('#projectGrid .rea');
    var count = document.getElementById('projectCount');
    var empty = document.getElementById('projectEmpty');
    var reset = filters.querySelector('.filters__reset');
    function applyFilters() {
      var secteur = filters.elements.secteur.value;
      var prestation = filters.elements.prestation.value;
      var visible = 0;
      items.forEach(function (item) {
        var ok = (!secteur || item.dataset.secteur.split(' ').indexOf(secteur) > -1) &&
                 (!prestation || item.dataset.prestation.split(' ').indexOf(prestation) > -1);
        item.hidden = !ok;
        if (ok) visible++;
      });
      count.textContent = visible + (visible > 1 ? ' domaines de réalisation' : ' domaine de réalisation');
      empty.hidden = visible > 0;
      reset.hidden = !secteur && !prestation;
    }
    filters.addEventListener('change', applyFilters);
    filters.addEventListener('reset', function () { setTimeout(applyFilters, 0); });
    document.getElementById('projectEmptyReset').addEventListener('click', function () { filters.reset(); });
    applyFilters();
  }

  // Filtre par thème de la page Blog
  var chips = document.querySelectorAll('#blogFilters .chip');
  if (chips.length) {
    var posts = document.querySelectorAll('.featured, #blogGrid .post');
    var blogEmpty = document.getElementById('blogEmpty');
    chips.forEach(function (chip) {
      var cat = chip.dataset.cat;
      var n = 0;
      posts.forEach(function (post) { if (!cat || post.dataset.cat === cat) n++; });
      chip.querySelector('.chip__count').textContent = n;
      chip.addEventListener('click', function () {
        var shown = 0;
        chips.forEach(function (c) {
          c.classList.toggle('is-active', c === chip);
          c.setAttribute('aria-pressed', c === chip);
        });
        posts.forEach(function (post) {
          var ok = !cat || post.dataset.cat === cat;
          post.hidden = !ok;
          if (ok) shown++;
        });
        blogEmpty.hidden = shown > 0;
      });
    });
  }

  // Page Contact : formulaire, pré-remplissage, rendez-vous, horaires
  var form = document.getElementById('contactForm');
  if (form) {
    var objet = form.elements.objet;
    var rdvFields = form.querySelectorAll('.field--rdv');
    var rdvDate = form.elements['rdv-date'];
    var rdvSlot = form.elements['rdv-creneau'];
    var message = form.elements.message;
    var success = document.getElementById('formSuccess');

    // Date minimale : demain
    var tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    rdvDate.min = tomorrow.toISOString().slice(0, 10);

    function toggleRdv() {
      var on = objet.value === 'rendez-vous';
      rdvFields.forEach(function (f) { f.hidden = !on; });
      rdvDate.required = on; rdvSlot.required = on;
    }
    function updateCount() { document.getElementById('messageCount').textContent = message.value.length + ' / 2000'; }

    function isWeekday(value) {
      var d = new Date(value + 'T12:00:00');
      return d.getDay() > 0 && d.getDay() < 6;
    }
    function checkField(el) {
      var field = el.closest('.field');
      if (!field || field.hidden) return true;
      var ok = el.type === 'checkbox' ? el.checked : el.checkValidity() && (!el.required || el.value.trim() !== '');
      if (ok && el === rdvDate && el.value) ok = isWeekday(el.value);
      field.classList.toggle('is-invalid', !ok);
      field.classList.toggle('is-valid', ok && el.type !== 'checkbox' && el.value.trim() !== '');
      el.setAttribute('aria-invalid', !ok);
      return ok;
    }

    // Pré-remplissage depuis les liens du site (?objet=devis&sujet=…)
    var params = new URLSearchParams(window.location.search);
    if (params.get('objet')) objet.value = params.get('objet');
    if (params.get('sujet')) message.value = 'Bonjour, je souhaite obtenir un devis pour : ' + params.get('sujet') + '.\n\n';
    toggleRdv(); updateCount();

    document.querySelectorAll('[data-objet]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        objet.value = link.dataset.objet; toggleRdv();
        document.getElementById('formulaire').scrollIntoView({ behavior: 'smooth' });
        setTimeout(function () { rdvDate.focus({ preventScroll: true }); }, 600);
      });
    });

    objet.addEventListener('change', toggleRdv);
    message.addEventListener('input', updateCount);
    form.addEventListener('blur', function (e) { if (e.target.matches('input, select, textarea') && e.target.value) checkField(e.target); }, true);
    form.addEventListener('input', function (e) { if (e.target.closest('.is-invalid')) checkField(e.target); });
    form.addEventListener('change', function (e) { if (e.target.type === 'checkbox' || e.target.tagName === 'SELECT') checkField(e.target); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      form.querySelectorAll('input, select, textarea').forEach(function (el) {
        if (!checkField(el) && !firstBad) firstBad = el;
      });
      if (firstBad) { firstBad.focus(); return; }

      var v = function (n) { return form.elements[n].value.trim(); };
      var label = objet.options[objet.selectedIndex].text;
      var lines = [
        'Nom : ' + v('prenom') + ' ' + v('nom'),
        'E-mail : ' + v('email'),
        'Téléphone : ' + v('telephone'),
        v('entreprise') ? 'Entreprise : ' + v('entreprise') : '',
        'Objet : ' + label,
        objet.value === 'rendez-vous' ? 'Rendez-vous souhaité : ' + new Date(v('rdv-date') + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + v('rdv-creneau') : '',
        '', v('message')
      ].filter(function (l, i, a) { return l !== '' || (i > 0 && a[i - 1] !== ''); });
      var subject = label + ' – ' + v('prenom') + ' ' + v('nom') + (v('entreprise') ? ' (' + v('entreprise') + ')' : '');
      window.location.href = 'mailto:contact@sfs-ci.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));

      form.hidden = true; success.hidden = false; success.focus();
    });

    document.getElementById('formRestart').addEventListener('click', function () {
      form.reset();
      form.querySelectorAll('.field').forEach(function (f) { f.classList.remove('is-valid', 'is-invalid'); });
      toggleRdv(); updateCount();
      success.hidden = true; form.hidden = false;
      form.elements.nom.focus();
    });

    // Ouvert / fermé (heure d'Abidjan = GMT)
    var status = document.getElementById('openStatus');
    var now = new Date(), day = now.getUTCDay(), h = now.getUTCHours();
    var open = day > 0 && day < 6 && h >= 8 && h < 18;
    status.textContent = open ? 'Ouvert actuellement' : 'Fermé actuellement';
    status.classList.add(open ? 'is-open' : 'is-closed');
  }

  // Apparition des sections au défilement
  var targets = document.querySelectorAll('.section-head, .card, .why__item, .sector, .step, .about__grid > *, .vmv__card, .leader__grid > *, .purpose__text, .purpose__cards li, .srv, .flow__step, .rea, .post, .featured, .quick__item');
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
