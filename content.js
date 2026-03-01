(function () {
  const FONT_MAP = {
    Inter: "Inter:wght@400;500;600;700",
    Roboto: "Roboto:wght@400;500;700",
    "Open Sans": "Open+Sans:wght@400;600;700",
    Montserrat: "Montserrat:wght@400;600;700",
    Raleway: "Raleway:wght@400;600;700",
    Nunito: "Nunito:wght@400;600;700",
    "Playfair Display": "Playfair+Display:wght@400;700",
    Georgia: null, // System font
    "Courier New": null, // System font
    "Cascadia Mono": null, // System font
  };

  const loadFonts = (rules) => {
    const fontsToLoad = new Set();
    rules.forEach((rule) => {
      if (
        rule.isActive &&
        rule.isFontFamilyEnabled !== false &&
        rule.fontFamily
      ) {
        // Extract font name from possible CSS quotes, e.g. "'Inter', sans-serif" -> "Inter"
        const match = rule.fontFamily.match(/'?([^',]+)'?/);
        if (match && FONT_MAP[match[1]]) {
          fontsToLoad.add(FONT_MAP[match[1]]);
        }
      }
    });

    let fontLink = document.getElementById("site-magic-fonts");

    if (fontsToLoad.size === 0) {
      if (fontLink) fontLink.remove();
      return;
    }

    const families = Array.from(fontsToLoad).join("&family=");
    const url = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;

    if (!fontLink) {
      fontLink = document.createElement("link");
      fontLink.id = "site-magic-fonts";
      fontLink.rel = "stylesheet";
      document.head.appendChild(fontLink);
    }

    if (fontLink.href !== url) {
      fontLink.href = url;
    }
  };

  const applyStyles = (settings) => {
    const rules = settings.rules || [];

    // Load needed web fonts
    loadFonts(rules);

    // Remove existing style if any
    const existingStyle = document.getElementById("site-magic-styles");
    if (existingStyle) existingStyle.remove();

    if (rules.length === 0) {
      // Handle legacy single-rule settings for migration/fallback
      const legacyRule = {
        targetSelector: settings.targetSelector,
        fontFamily: settings.fontFamily,
        fontSize: settings.fontSize,
        textColor: settings.textColor,
        isFontFamilyEnabled: settings.isFontFamilyEnabled,
        isFontSizeEnabled: settings.isFontSizeEnabled,
        isTextColorEnabled: settings.isTextColorEnabled,
        isActive: true,
      };
      if (
        legacyRule.targetSelector ||
        legacyRule.fontFamily ||
        legacyRule.fontSize ||
        legacyRule.textColor
      ) {
        rules.push(legacyRule);
      }
    }

    if (rules.length === 0) return;

    const style = document.createElement("style");
    style.id = "site-magic-styles";

    let consolidatedCss = "";

    rules.forEach((rule) => {
      if (!rule.isActive) return;

      let selectors = [];
      if (rule.targetSelector) {
        selectors = [rule.targetSelector, `${rule.targetSelector} *`];
      } else {
        selectors = [
          "html",
          "body",
          "p",
          "span",
          "div",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "a",
          "li",
          "td",
          "th",
        ];
      }

      const baseSelector = selectors.join(", ");
      let css = `${baseSelector} {`;

      if (
        rule.isFontFamilyEnabled !== false &&
        rule.fontFamily &&
        rule.fontFamily !== "inherit"
      ) {
        css += `font-family: ${rule.fontFamily} !important;`;
      }
      if (rule.isFontSizeEnabled !== false && rule.fontSize) {
        css += `font-size: ${rule.fontSize}px !important;`;
      }
      if (rule.isTextColorEnabled !== false && rule.textColor) {
        css += `color: ${rule.textColor} !important;`;
      }
      css += "}";
      consolidatedCss += css + "\n";
    });

    style.textContent = consolidatedCss;
    document.documentElement.appendChild(style);
  };

  const getSettings = () => {
    chrome.storage.sync.get(
      [
        "rules",
        "fontFamily",
        "fontSize",
        "textColor",
        "isFontFamilyEnabled",
        "isFontSizeEnabled",
        "isTextColorEnabled",
        "targetSelector",
      ],
      (result) => {
        applyStyles(result);
      },
    );
  };

  // Picker Logic
  let isPicking = false;
  let hoveredElement = null;

  const getSelector = (el) => {
    const path = [];
    let current = el;

    // Stop if the element itself is body or html
    if (current === document.body || current === document.documentElement)
      return "";

    while (
      current &&
      current.nodeType === Node.ELEMENT_NODE &&
      current !== document.body &&
      current !== document.documentElement
    ) {
      let selector = current.tagName.toLowerCase();

      if (current.id) {
        selector = `#${CSS.escape(current.id)}`;
      } else {
        if (current.classList.length > 0) {
          selector +=
            "." +
            Array.from(current.classList)
              .map((c) => CSS.escape(c))
              .join(".");
        }

        // Add nth-of-type if not unique among same-tagged/classed siblings
        if (current.parentNode) {
          const siblings = Array.from(current.parentNode.children).filter(
            (child) => child.tagName === current.tagName,
          );
          const sameSelectorSiblings = Array.from(
            current.parentNode.children,
          ).filter((child) => {
            if (child.tagName !== current.tagName) return false;
            if (current.classList.length > 0) {
              return Array.from(current.classList).every((c) =>
                child.classList.contains(c),
              );
            }
            return true;
          });

          if (sameSelectorSiblings.length > 1) {
            const index = siblings.indexOf(current) + 1;
            selector += `:nth-of-type(${index})`;
          }
        }
      }

      path.unshift(selector);
      current = current.parentNode;
    }

    return path.join(" > ");
  };

  const handleMouseOver = (e) => {
    if (!isPicking) return;
    e.stopPropagation();

    if (hoveredElement) {
      hoveredElement.style.outline = "";
      hoveredElement.style.backgroundColor = "";
    }

    hoveredElement = e.target;
    hoveredElement.style.outline = "3px solid #008b8b";
    hoveredElement.style.backgroundColor = "rgba(0, 139, 139, 0.2)";
  };

  const handleClick = (e) => {
    if (!isPicking) return;
    e.preventDefault();
    e.stopPropagation();

    const selector = getSelector(e.target);
    stopPicking();
    chrome.runtime.sendMessage({ action: "pickingComplete", selector });
  };

  const startPicking = () => {
    isPicking = true;
    document.body.style.cursor = "crosshair";
    document.addEventListener("mouseover", handleMouseOver, true);
    document.addEventListener("click", handleClick, true);
  };

  const stopPicking = () => {
    isPicking = false;
    document.body.style.cursor = "";
    document.removeEventListener("mouseover", handleMouseOver, true);
    document.removeEventListener("click", handleClick, true);
    if (hoveredElement) {
      hoveredElement.style.outline = "";
      hoveredElement.style.backgroundColor = "";
    }
  };

  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "startPicking") {
      startPicking();
    }
  });

  // Load initial styles
  getSettings();

  // Listen for changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync") {
      getSettings();
    }
  });

  // Reinforce styles on DOM updates (optional but helpful for SPAs)
  const observer = new MutationObserver(() => {
    const style = document.getElementById("site-magic-styles");
    if (style && style.parentElement !== document.documentElement) {
      document.documentElement.appendChild(style);
    }
  });

  observer.observe(document.documentElement, { childList: true });
})();
