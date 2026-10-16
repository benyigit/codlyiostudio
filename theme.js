const themeButtons = document.querySelectorAll("[data-footer-theme-toggle]");
document.documentElement.classList.toggle("light-theme", window.codlyioI18n?.getTheme() !== "dark");

function syncThemeButtons() {
  const light = document.documentElement.classList.contains("light-theme");
  const english = window.codlyioI18n?.getLanguage() === "en";
  const action = light ? (english ? "Switch to dark theme" : "Koyu temaya geç") : (english ? "Switch to light theme" : "Açık temaya geç");
  const label = light ? (english ? "Dark theme" : "Koyu tema") : (english ? "Light theme" : "Açık tema");

  themeButtons.forEach((button) => {
    button.setAttribute("aria-label", action);
    button.title = action;
    const text = button.querySelector("[data-theme-label]");
    const icon = button.querySelector("[data-theme-icon]");
    if (text) text.textContent = label;
    if (icon) icon.textContent = light ? "☾" : "☀";
  });
}

syncThemeButtons();
document.addEventListener("codlyio-language-change", syncThemeButtons);
themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const light = document.documentElement.classList.toggle("light-theme");
    window.codlyioI18n?.setTheme(light ? "light" : "dark");
    syncThemeButtons();
  });
});

document.querySelectorAll("[data-back-to-top]").forEach((button) => {
  button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
});

if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  document.querySelectorAll('a[href="https://studio.codlyio.com"]').forEach((link) => {
    link.href = "/office";
  });
}
