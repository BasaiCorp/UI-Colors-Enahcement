// theme toggle
const toggleBtn = document.querySelector(".toggle-btn");
toggleBtn.addEventListener("click", toggle);

function toggle() {
  document.body.classList.toggle("light");
  updateCssVarsPre();
}

// Sliders
const hueSlider = document.getElementById("hue-slider");
const chromaSlider = document.getElementById("chroma-slider");
const borderRadiusSlider = document.getElementById("border-radius-slider");

function getResolvedCssVars() {
  const hue = Number(hueSlider.value);
  const hueSecondary = (hue + 180) % 360;
  const chroma = Number(chromaSlider.value);
  const isLight = document.body.classList.contains("light");

  const chromaBg = +(chroma * 0.5).toFixed(3);
  const chromaText = +Math.min(chroma, 0.1).toFixed(3);
  const chromaAction = +Math.max(chroma, 0.1).toFixed(3);
  const chromaAlert = +Math.max(chroma, 0.05).toFixed(3);

  if (!isLight) {
    // Dark mode
    return [
      [`--bg-dark`, `oklch(0.1 ${chromaBg} ${hue})`],
      [`--bg`, `oklch(0.15 ${chromaBg} ${hue})`],
      [`--bg-light`, `oklch(0.2 ${chromaBg} ${hue})`],
      [`--text`, `oklch(0.96 ${chromaText} ${hue})`],
      [`--text-muted`, `oklch(0.76 ${chromaText} ${hue})`],
      [`--text-dark`, `oklch(0.85 ${chromaText} ${hue})`],
      [`--highlight`, `oklch(0.5 ${chroma} ${hue})`],
      [`--border`, `oklch(0.4 ${chroma} ${hue})`],
      [`--border-muted`, `oklch(0.3 ${chroma} ${hue})`],
      [`--primary`, `oklch(0.76 ${chromaAction} ${hue})`],
      [`--primary-dark`, `oklch(0.66 ${chromaAction} ${hue})`],
      [`--secondary`, `oklch(0.76 ${chromaAction} ${hueSecondary})`],
      [`--secondary-light`, `oklch(0.86 ${chromaAction} ${hueSecondary})`],
      [`--danger`, `oklch(0.7 ${chromaAlert} 30)`],
      [`--warning`, `oklch(0.7 ${chromaAlert} 100)`],
      [`--success`, `oklch(0.7 ${chromaAlert} 160)`],
      [`--info`, `oklch(0.7 ${chromaAlert} 260)`],
    ];
  } else {
    // Light mode
    return [
      [`--bg-dark`, `oklch(0.92 ${chromaBg} ${hue})`],
      [`--bg`, `oklch(0.96 ${chromaBg} ${hue})`],
      [`--bg-light`, `oklch(1 ${chromaBg} ${hue})`],
      [`--text`, `oklch(0.15 ${chromaText} ${hue})`],
      [`--text-muted`, `oklch(0.4 ${chromaText} ${hue})`],
      [`--text-dark`, `oklch(0.25 ${chromaText} ${hue})`],
      [`--highlight`, `oklch(1 ${chroma} ${hue})`],
      [`--border`, `oklch(0.6 ${chroma} ${hue})`],
      [`--border-muted`, `oklch(0.7 ${chroma} ${hue})`],
      [`--primary`, `oklch(0.4 ${chromaAction} ${hue})`],
      [`--primary-dark`, `oklch(0.3 ${chromaAction} ${hue})`],
      [`--secondary`, `oklch(0.4 ${chromaAction} ${hueSecondary})`],
      [`--secondary-light`, `oklch(0.5 ${chromaAction} ${hueSecondary})`],
      [`--danger`, `oklch(0.5 ${chromaAlert} 30)`],
      [`--warning`, `oklch(0.5 ${chromaAlert} 100)`],
      [`--success`, `oklch(0.5 ${chromaAlert} 160)`],
      [`--info`, `oklch(0.5 ${chromaAlert} 260)`],
    ];
  }
}

function updateCssVarsPre() {
  const pre = document.getElementById("css-vars");
  if (!pre) return;
  const resolved = getResolvedCssVars();
  pre.textContent = resolved.map(([k, v]) => `${k}: ${v};`).join("\n");
  const select = document.getElementById("color-format");
  if (select.value !== "oklch") {
    select.value = "oklch";
  }
  renderCssVars("oklch");
}

// Update both on slider and theme toggle
function updateHueChroma() {
  document.documentElement.style.setProperty("--hue", hueSlider.value);
  document.documentElement.style.setProperty("--chroma", chromaSlider.value);
  updateCssVarsPre();
}

updateHueChroma();
updateCssVarsPre();

hueSlider.addEventListener("input", updateHueChroma);
chromaSlider.addEventListener("input", updateHueChroma);
borderRadiusSlider.addEventListener("input", () => {
  document.documentElement.style.setProperty(
    "--border-radius",
    `${borderRadiusSlider.value}px`
  );
});

// Font selection
const headingFontSelect = document.getElementById("heading-font-select");
const bodyFontSelect = document.getElementById("body-font-select");
const buttonFontSelect = document.getElementById("button-font-select");

headingFontSelect.addEventListener("change", () => {
  document.documentElement.style.setProperty(
    "--ff-heading",
    headingFontSelect.value
  );
});

bodyFontSelect.addEventListener("change", () => {
  document.documentElement.style.setProperty("--ff-body", bodyFontSelect.value);
});

buttonFontSelect.addEventListener("change", () => {
  document.documentElement.style.setProperty(
    "--ff-button",
    buttonFontSelect.value
  );
});

// Theme selection
const themeSchemeSelect = document.getElementById("theme-scheme-select");
themeSchemeSelect.addEventListener("change", () => {
  const theme = themeSchemeSelect.value;
  const hue = Number(hueSlider.value);
  let hueSecondary = (hue + 180) % 360;
  if (theme === "analogous") {
    hueSecondary = (hue + 30) % 360;
  } else if (theme === "monochromatic") {
    hueSecondary = hue;
  }
  document.documentElement.style.setProperty("--hue-secondary", hueSecondary);
  updateCssVarsPre();
});

function parseOklch(str) {
  const match = str.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/i);
  if (!match) return null;
  return {
    l: parseFloat(match[1]),
    c: parseFloat(match[2]),
    h: parseFloat(match[3]),
  };
}

// Convert OKLCH to HSL using culori CDN
async function oklchToHsl({ l, c, h }) {
  const { oklch: culoriOklch, hsl: culoriHsl } = window.culori;
  const rgb = culoriOklch({ mode: "oklch", l, c, h });
  const hslColor = culoriHsl(rgb);
  if (!hslColor) return "hsl(0 0% 0%)";
  function fixTo100(value) {
    const v = Math.round(value * 100);
    return v < 0 || v > 100 ? 100 : v;
  }

  return `hsl(${Math.round(hslColor.h)} ${fixTo100(hslColor.s)}% ${fixTo100(
    hslColor.l
  )}%)`;
}
function getCssVars() {
  return document.getElementById("css-vars").textContent.trim().split("\n");
}

async function getVarsMap(isLight) {
  const original = document.body.classList.contains("light");
  if (isLight) {
    document.body.classList.add("light");
  } else {
    document.body.classList.remove("light");
  }
  const resolved = getResolvedCssVars();
  const vars = {};
  for (const [k, v] of resolved) {
    const oklch = parseOklch(v);
    let hsl = v;
    if (oklch) {
      hsl = await oklchToHsl(oklch);
    }
    vars[k] = { oklch: v, hsl };
  }
  if (original !== isLight) {
    if (original) document.body.classList.add("light");
    else document.body.classList.remove("light");
  }
  return vars;
}

async function renderCssVars(format) {
  const pre = document.getElementById("css-vars");
  const select = document.getElementById("color-format");
  if (select.value !== format) {
    select.value = format;
  }

  if (format === "oklch") {
    const resolved = getResolvedCssVars();
    pre.textContent = resolved.map(([k, v]) => `${k}: ${v};`).join("\n");
    return;
  }

  if (format === "theme") {
    const varsDark = await getVarsMap(false);
    const varsLight = await getVarsMap(true);
    pre.textContent = generateThemeExport(varsDark, varsLight);
    return;
  }

  if (format === "hsl") {
    const resolved = getResolvedCssVars();
    const lines = [];
    for (const [k, v] of resolved) {
      const oklch = parseOklch(v);
      let hsl = v;
      if (oklch) {
        hsl = await oklchToHsl(oklch);
      }
      lines.push(`${k}: ${hsl};`);
    }
    pre.textContent = lines.join("\n");
    return;
  }

  const lines = getCssVars();
  const newLines = [];
  for (const line of lines) {
    const match = line.match(/(:\s*)(oklch\([^)]+\))/i);
    if (!match) {
      newLines.push(line);
      continue;
    }
    const oklch = parseOklch(match[2]);
    if (!oklch) {
      newLines.push(line);
      continue;
    }
    const hsl = await oklchToHsl(oklch);
    newLines.push(line.replace(match[2], hsl));
  }
  pre.textContent = newLines.join("\n");
}

document
  .getElementById("color-format")
  .addEventListener("change", function (e) {
    renderCssVars(e.target.value);
  });

document.querySelector(".copy-code").addEventListener("click", function () {
  const btn = this;
  const cssVars = document.getElementById("css-vars").textContent;
  navigator.clipboard.writeText(cssVars).then(() => {
    btn.textContent = "Copied";
    setTimeout(() => {
      btn.textContent = "Copy";
    }, 2000);
  });
});

window.addEventListener("DOMContentLoaded", function () {
  renderCssVars(document.getElementById("color-format").value);
});

// modals
const showCode = document.querySelector(".show-code");
const showAlerts = document.querySelector(".show-alerts");
const codeModal = document.querySelector(".code-modal");
const statesModal = document.querySelector(".states-modal");
showCode.addEventListener("click", () => codeModal.showModal());
showAlerts.addEventListener("click", () => statesModal.showModal());
document.querySelectorAll(".close-modal").forEach((btn) => {
  btn.addEventListener("click", () => {
    const dialog = btn.closest("dialog");
    if (dialog) dialog.close();
  });
});
// Close modals
document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      dialog.close();
    }
  });
});

function generateThemeExport(varsDark, varsLight) {
  const headingFont = headingFontSelect.value;
  const bodyFont = bodyFontSelect.value;
  const buttonFont = buttonFontSelect.value;

  // Dark mode
  let hslDark = "";
  let oklchDark = "";
  for (const [name, { oklch, hsl }] of Object.entries(varsDark)) {
    hslDark += `  ${name}: ${hsl};\n`;
    oklchDark += `  ${name}: ${oklch};\n`;
  }
  // Light mode
  let hslLight = "";
  let oklchLight = "";
  for (const [name, { oklch, hsl }] of Object.entries(varsLight)) {
    hslLight += `  ${name}: ${hsl};\n`;
    oklchLight += `  ${name}: ${oklch};\n`;
  }
  return `:root {
  /* hsl (fallback color) */
${hslDark}
  /* oklch */
${oklchDark}
  --ff-heading: "${headingFont}", sans-serif;
  --ff-body: "${bodyFont}", sans-serif;
  --ff-button: "${buttonFont}", sans-serif;
}
body.light {
  /* hsl (fallback color) */
${hslLight}
  /* oklch */
${oklchLight}
}

/* Add default component styles */
button {
  font-family: var(--ff-button);
  background-color: var(--primary);
  color: var(--text-dark);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}
button:hover {
  background-color: var(--primary-dark);
}
.card {
  background: var(--bg-gradient);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
}
.alert {
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  margin-bottom: 1rem;
}
.alert-danger {
  background-color: var(--danger);
  color: var(--text-dark);
}
.alert-warning {
  background-color: var(--warning);
  color: var(--text-dark);
}
.alert-success {
  background-color: var(--success);
  color: var(--text-dark);
}
.alert-info {
  background-color: var(--info);
  color: var(--text-dark);
}
`;
}
