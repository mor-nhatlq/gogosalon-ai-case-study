/**
 * Navigation — Smooth scroll and active section highlight
 */
(function () {
  var navLinks = document.querySelectorAll('.nav-link');
  var sections = document.querySelectorAll('section[id]');
  var NAV_HEIGHT = 64;

  /* Smooth scroll on nav link click */
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var targetId = this.getAttribute('href').slice(1);
      var target = document.getElementById(targetId);
      if (!target) return;
      var top = target.offsetTop - NAV_HEIGHT;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* Highlight active section based on scroll position */
  function updateActiveNav() {
    var scrollPos = window.scrollY + NAV_HEIGHT + 100;
    var currentId = '';

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) {
        currentId = section.id;
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentId) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();
})();
