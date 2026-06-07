(function () {
  function showPage(hash) {
    if (!hash || !document.querySelector(hash)) hash = '#sec-overview';

    document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));
    const target = document.querySelector(hash);
    if (target) {
      target.classList.add('active');
      window.scrollTo(0, 0);
    }

    document.querySelectorAll('#sidebar .sb-link').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === hash);
    });

    if (typeof renderActiveTable === 'function') renderActiveTable(hash);
    if (typeof renderCharts === 'function') renderCharts();
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#sidebar .sb-link').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const hash = a.getAttribute('href');
        history.pushState(null, '', hash);
        showPage(hash);
      });
    });

    window.addEventListener('popstate', () => showPage(location.hash));
  });

  window.showPage = showPage;
})();
