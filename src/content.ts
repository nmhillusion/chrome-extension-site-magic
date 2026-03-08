interface StyleRule {
  id: string;
  name: string;
  targetSelector: string;
  fontFamily: string;
  fontSize: string;
  textColor: string;
  bgColor: string;
  padding: string;
  isFontFamilyEnabled: boolean;
  isFontSizeEnabled: boolean;
  isTextColorEnabled: boolean;
  isBgColorEnabled: boolean;
  isPaddingEnabled: boolean;
  isActive: boolean;
}

(function () {
  const FONT_MAP: Record<string, string | null> = {
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

  const loadFonts = (rules: StyleRule[]) => {
    const fontsToLoad = new Set<string>();
    rules.forEach((rule) => {
      if (
        rule.isActive &&
        rule.isFontFamilyEnabled !== false &&
        rule.fontFamily
      ) {
        // Extract font name from possible CSS quotes, e.g. "'Inter', sans-serif" -> "Inter"
        const match = rule.fontFamily.match(/'?([^',]+)'?/);
        if (match && FONT_MAP[match[1]]) {
          fontsToLoad.add(FONT_MAP[match[1]] as string);
        }
      }
    });

    let fontLink = document.getElementById(
      "site-magic-fonts",
    ) as HTMLLinkElement | null;

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

  const applyStyles = (settings: any) => {
    const rules: StyleRule[] = settings.rules || [];

    // Load needed web fonts
    loadFonts(rules);

    let styleTag = document.getElementById(
      "site-magic-styles",
    ) as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "site-magic-styles";
      (document.head || document.documentElement).appendChild(styleTag);
    }

    if (rules.length === 0) {
      // Fallback migration logic
      const legacyRule: StyleRule = {
        id: "legacy",
        name: "Legacy Rule",
        targetSelector: settings.targetSelector,
        fontFamily: settings.fontFamily,
        fontSize: settings.fontSize,
        textColor: settings.textColor,
        bgColor: settings.bgColor,
        padding: settings.padding,
        isFontFamilyEnabled: settings.isFontFamilyEnabled !== false,
        isFontSizeEnabled: settings.isFontSizeEnabled !== false,
        isTextColorEnabled: settings.isTextColorEnabled !== false,
        isBgColorEnabled: settings.isBgColorEnabled !== false,
        isPaddingEnabled: settings.isPaddingEnabled !== false,
        isActive: true,
      };
      if (legacyRule.targetSelector || legacyRule.textColor) {
        rules.push(legacyRule);
      }
    }

    let consolidatedCss = "";
    rules.forEach((rule) => {
      if (!rule.isActive) return;

      let selectors: string[] = [];
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
      if (rule.isBgColorEnabled !== false && rule.bgColor) {
        css += `background-color: ${rule.bgColor} !important;`;
      }
      if (rule.isPaddingEnabled !== false && rule.padding) {
        css += `padding: ${rule.padding}px !important;`;
      }
      css += "}";
      consolidatedCss += css + "\n";
    });

    styleTag.textContent = consolidatedCss;
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
        "isBgColorEnabled",
        "isPaddingEnabled",
        "padding",
        "targetSelector",
      ],
      (result) => {
        applyStyles(result);
      },
    );
  };

  // Picker Logic
  let isPicking = false;
  let hoveredElement: HTMLElement | null = null;

  const getSelector = (el: HTMLElement): string => {
    const path: string[] = [];
    let current: HTMLElement | null = el;

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
          const siblings = Array.from(
            (current.parentNode as HTMLElement).children,
          ).filter((child) => child.tagName === current!.tagName);
          const sameSelectorSiblings = Array.from(
            (current.parentNode as HTMLElement).children,
          ).filter((child) => {
            if (child.tagName !== current!.tagName) return false;
            if (current!.classList.length > 0) {
              return Array.from(current!.classList).every((c) =>
                (child as HTMLElement).classList.contains(c),
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
      current = current.parentNode as HTMLElement | null;
    }

    return path.join(" > ");
  };

  const handleMouseOver = (e: MouseEvent) => {
    if (!isPicking) return;
    e.stopPropagation();

    if (hoveredElement) {
      hoveredElement.style.outline = "";
      hoveredElement.style.backgroundColor = "";
    }

    hoveredElement = e.target as HTMLElement;
    if (hoveredElement) {
      hoveredElement.style.outline = "3px solid #008b8b";
      hoveredElement.style.backgroundColor = "rgba(0, 139, 139, 0.2)";
    }
  };

  const handleClick = (e: MouseEvent) => {
    if (!isPicking) return;
    e.preventDefault();
    e.stopPropagation();

    const selector = getSelector(e.target as HTMLElement);
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

  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === "startPicking") {
      startPicking();
      sendResponse({ status: "success" });
    } else if (request.action === "reapplyStyles") {
      if (request.rules) {
        applyStyles({ rules: request.rules });
      } else {
        getSettings();
      }
      sendResponse({ status: "success" });
    }
    return true;
  });

  // Load initial styles
  getSettings();

  // Listen for changes
  chrome.storage.onChanged.addListener((_changes, _namespace) => {
    if (_namespace === "sync") {
      getSettings();
    }
  });

  // Reinforce styles on DOM updates
  const observer = new MutationObserver(() => {
    const style = document.getElementById("site-magic-styles");
    if (style && style.parentElement !== document.documentElement) {
      document.documentElement.appendChild(style);
    }
  });

  observer.observe(document.documentElement, { childList: true });
})();
