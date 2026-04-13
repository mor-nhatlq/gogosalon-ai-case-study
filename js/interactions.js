/**
 * Interactions — Count-up, accordion, fade-in, dynamic content
 */
(function () {

  /* ---- Count-Up Animation ---- */
  function animateCountUp(el) {
    var target = parseFloat(el.dataset.target);
    var suffix = el.dataset.suffix || '';
    var prefix = el.dataset.prefix || '';
    var decimals = parseInt(el.dataset.decimals) || 0;
    var duration = 1500;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      /* ease-out cubic */
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = eased * target;
      el.textContent = prefix + current.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  /* Run count-up on page load (hero) */
  document.querySelectorAll('.kpi-number').forEach(animateCountUp);

  /* Run count-up on scroll for ROI cards */
  var roiAnimated = false;
  if ('IntersectionObserver' in window) {
    var roiSection = document.getElementById('roi');
    if (roiSection) {
      var roiObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !roiAnimated) {
            roiAnimated = true;
            document.querySelectorAll('.roi-number').forEach(animateCountUp);
            roiObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      roiObserver.observe(roiSection);
    }
  }

  /* ---- Scroll Fade-In (IntersectionObserver) ---- */
  var fadeEls = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window) {
    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    fadeEls.forEach(function (el) { fadeObserver.observe(el); });
  } else {
    /* Fallback: show all immediately */
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---- Build Accordion from TASKS data ---- */
  function getBadgeClass(pct) {
    if (pct >= 0.5) return 'badge-green';
    if (pct >= 0.3) return 'badge-yellow';
    return 'badge-gray';
  }

  function buildAccordionItem(task) {
    var saved = task.effortTotal.withoutAI - task.effortTotal.withAI;
    var pctLabel = Math.round(task.effortSaved * 100) + '%';

    return '<div class="accordion-item">' +
      '<div class="accordion-header" data-task-id="' + task.id + '">' +
        '<div class="accordion-header-left">' +
          '<span class="accordion-id">#' + task.id + '</span>' +
          '<span class="accordion-name">' + task.name + '</span>' +
          '<span class="accordion-category">' + task.category + '</span>' +
        '</div>' +
        '<div class="accordion-header-right">' +
          '<span class="badge ' + getBadgeClass(task.effortSaved) + '">-' + pctLabel + '</span>' +
          '<span class="accordion-arrow">&#9660;</span>' +
        '</div>' +
      '</div>' +
      '<div class="accordion-body">' +
        '<div class="accordion-body-inner">' +
          '<div class="metric-grid">' +
            '<div class="metric-card">' +
              '<span class="metric-value metric-value-blue">' + task.effortTotal.withoutAI.toFixed(1) + ' MD</span>' +
              '<span class="metric-label">Không AI</span>' +
            '</div>' +
            '<div class="metric-card">' +
              '<span class="metric-value metric-value-green">' + task.effortTotal.withAI.toFixed(1) + ' MD</span>' +
              '<span class="metric-label">Có AI</span>' +
            '</div>' +
            '<div class="metric-card">' +
              '<span class="metric-value metric-value-red">' + saved.toFixed(1) + ' MD</span>' +
              '<span class="metric-label">Tiết kiệm</span>' +
            '</div>' +
          '</div>' +
          '<div class="detail-text">' +
            (task.effortFE.withoutAI > 0 ? '<strong>FE:</strong> ' + task.effortFE.withoutAI + ' MD &rarr; ' + task.effortFE.withAI + ' MD &nbsp;|&nbsp; ' : '') +
            (task.effortBE.withoutAI > 0 ? '<strong>BE:</strong> ' + task.effortBE.withoutAI + ' MD &rarr; ' + task.effortBE.withAI + ' MD' : '') +
            '<br><strong>Vai trò AI:</strong> ' + task.aiRole +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  var featuresHtml = '';
  var bugsHtml = '';

  TASKS.forEach(function (task) {
    if (task.group === 'feature') {
      featuresHtml += buildAccordionItem(task);
    } else {
      bugsHtml += buildAccordionItem(task);
    }
  });

  document.getElementById('accordion-features').innerHTML = featuresHtml;
  document.getElementById('accordion-bugs').innerHTML = bugsHtml;

  /* ---- Accordion Toggle ---- */
  document.querySelectorAll('.accordion-header').forEach(function (header) {
    header.addEventListener('click', function () {
      var item = this.parentElement;
      var body = item.querySelector('.accordion-body');
      var isOpen = item.classList.contains('open');

      /* Close all others in same accordion */
      var accordion = item.parentElement;
      accordion.querySelectorAll('.accordion-item.open').forEach(function (openItem) {
        openItem.classList.remove('open');
        openItem.querySelector('.accordion-body').style.maxHeight = null;
      });

      /* Toggle current */
      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  /* ---- Adoption Reasons ---- */
  var reasonsHtml = '';
  ADOPTION.reasons.forEach(function (r) {
    reasonsHtml += '<div class="reason-item">' +
      '<span>' + r.reason + '</span>' +
      '<span class="reason-count">' + r.count + '</span>' +
    '</div>';
  });
  document.getElementById('reasons-list').innerHTML = reasonsHtml;

  var adoptionPct = Math.round((ADOPTION.usingAI / ADOPTION.totalFunctions) * 100);
  document.getElementById('adoption-insight').textContent =
    adoptionPct + '% tổng số chức năng (' + ADOPTION.usingAI + '/' + ADOPTION.totalFunctions +
    ') đã áp dụng AI trong quá trình phát triển.';

})();
