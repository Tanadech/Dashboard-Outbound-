(function () {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      document.querySelectorAll('#navBar a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + id);
      });
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.dash-section').forEach(s => observer.observe(s));
  });
})();
