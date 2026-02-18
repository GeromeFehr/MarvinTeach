(function () {
  const buttons = document.querySelectorAll('a.ctaPrimary, a.btn');
  function pop(e) {
    // dezenter "troll": vibrierender Glow (kein Pop-up, kein Scam-Feeling)
    const el = e.currentTarget;
    el.style.transition = "transform .08s ease";
    el.style.transform = "translateY(-2px) scale(1.01)";
    setTimeout(() => (el.style.transform = ""), 120);
  }
  buttons.forEach(b => b.addEventListener("click", pop));
})();
