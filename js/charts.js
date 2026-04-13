/**
 * Charts — Chart.js configurations with scroll-triggered animation
 */
(function () {
  var chartInstances = {};
  var chartInitialized = {};

  /* Common Chart.js defaults */
  Chart.defaults.font.family = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  Chart.defaults.font.size = 13;
  Chart.defaults.color = '#6b7280';

  /* ---- Bar Chart: Total Effort Comparison ---- */
  function initBarChart() {
    var ctx = document.getElementById('chart-effort-bar');
    if (!ctx || chartInitialized['bar']) return;
    chartInitialized['bar'] = true;

    chartInstances['bar'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Không dùng AI', 'Có dùng AI', 'Tiết kiệm'],
        datasets: [{
          data: [SUMMARY.totalMMWithoutAI, SUMMARY.totalMMWithAI, SUMMARY.mmSaved],
          backgroundColor: ['#93c5fd', '#1e40af', '#16a34a'],
          borderRadius: 6,
          maxBarThickness: 80
        }]
      },
      options: {
        responsive: true,
        animation: { duration: 1200, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (ctx) { return ctx.parsed.y.toFixed(2) + ' MM'; }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Man-Months' },
            grid: { color: '#f3f4f6' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  /* ---- Line Chart: Cumulative Effort ---- */
  function initLineChart() {
    var ctx = document.getElementById('chart-cumulative-line');
    if (!ctx || chartInitialized['line']) return;
    chartInitialized['line'] = true;

    var labels = TASKS.map(function (t) { return '#' + t.id; });
    var withoutAI = TASKS.map(function (t) { return t.cumulativeTotal.withoutAI; });
    var withAI = TASKS.map(function (t) { return t.cumulativeTotal.withAI; });

    chartInstances['line'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Không AI',
            data: withoutAI,
            borderColor: '#dc2626',
            backgroundColor: 'rgba(220,38,38,0.08)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            pointHoverRadius: 6
          },
          {
            label: 'Có AI',
            data: withAI,
            borderColor: '#1e40af',
            backgroundColor: 'rgba(30,64,175,0.08)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        animation: { duration: 1500, easing: 'easeOutQuart' },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (ctx) { return ctx.dataset.label + ': ' + ctx.parsed.y.toFixed(1) + ' MD'; }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Man-Days (tích luỹ)' },
            grid: { color: '#f3f4f6' }
          },
          x: {
            title: { display: true, text: 'Task' },
            grid: { display: false }
          }
        }
      }
    });
  }

  /* ---- Doughnut Chart: Adoption Rate ---- */
  function initDoughnutChart() {
    var ctx = document.getElementById('chart-adoption-doughnut');
    if (!ctx || chartInitialized['doughnut']) return;
    chartInitialized['doughnut'] = true;

    chartInstances['doughnut'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Có dùng AI', 'Không dùng AI'],
        datasets: [{
          data: [ADOPTION.usingAI, ADOPTION.notUsingAI],
          backgroundColor: ['#1e40af', '#e5e7eb'],
          borderWidth: 0,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        animation: { duration: 1200, easing: 'easeOutQuart' },
        cutout: '60%',
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                var total = ADOPTION.totalFunctions;
                var pct = Math.round((ctx.parsed / total) * 100);
                return ctx.label + ': ' + ctx.parsed + '/' + total + ' (' + pct + '%)';
              }
            }
          }
        }
      }
    });
  }

  /* ---- Horizontal Stacked Bar: FE vs BE Breakdown ---- */
  function initFEBEChart() {
    var ctx = document.getElementById('chart-fe-be-stacked');
    if (!ctx || chartInitialized['febe']) return;
    chartInitialized['febe'] = true;

    /* Calculate FE/BE totals from TASKS */
    var feTotalWithout = 0, feTotalWith = 0, beTotalWithout = 0, beTotalWith = 0;
    TASKS.forEach(function (t) {
      feTotalWithout += t.effortFE.withoutAI;
      feTotalWith += t.effortFE.withAI;
      beTotalWithout += t.effortBE.withoutAI;
      beTotalWith += t.effortBE.withAI;
    });

    var feSaved = feTotalWithout - feTotalWith;
    var beSaved = beTotalWithout - beTotalWith;

    chartInstances['febe'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Frontend', 'Backend'],
        datasets: [
          {
            label: 'Effort với AI',
            data: [feTotalWith, beTotalWith],
            backgroundColor: '#1e40af',
            borderRadius: { topLeft: 6, bottomLeft: 6 }
          },
          {
            label: 'Effort tiết kiệm',
            data: [feSaved, beSaved],
            backgroundColor: '#93c5fd',
            borderRadius: { topRight: 6, bottomRight: 6 }
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        animation: { duration: 1200, easing: 'easeOutQuart' },
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: function (ctx) { return ctx.dataset.label + ': ' + ctx.parsed.x.toFixed(1) + ' MD'; },
              afterBody: function (tooltipItems) {
                var idx = tooltipItems[0].dataIndex;
                var total = idx === 0 ? feTotalWithout : beTotalWithout;
                var saved = idx === 0 ? feSaved : beSaved;
                return 'Tổng: ' + total.toFixed(1) + ' MD | Tiết kiệm: ' + Math.round((saved / total) * 100) + '%';
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            beginAtZero: true,
            title: { display: true, text: 'Man-Days' },
            grid: { color: '#f3f4f6' }
          },
          y: {
            stacked: true,
            grid: { display: false }
          }
        }
      }
    });
  }

  /* ---- Scroll-Triggered Chart Init ---- */
  var chartSections = [
    { id: 'chart-effort-bar', init: initBarChart },
    { id: 'chart-cumulative-line', init: initLineChart },
    { id: 'chart-adoption-doughnut', init: initDoughnutChart },
    { id: 'chart-fe-be-stacked', init: initFEBEChart }
  ];

  if ('IntersectionObserver' in window) {
    var chartObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          chartSections.forEach(function (cs) {
            if (entry.target.id === cs.id) cs.init();
          });
          chartObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    chartSections.forEach(function (cs) {
      var el = document.getElementById(cs.id);
      if (el) chartObserver.observe(el);
    });
  } else {
    /* Fallback: init all immediately */
    chartSections.forEach(function (cs) { cs.init(); });
  }

})();
