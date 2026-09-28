interface StyleRule {
  id: string;
  name: string;
  domain: string;
  targetSelector: string;
  fontFamily: { isEnabled: boolean; value: string };
  fontSize: { isEnabled: boolean; value: string };
  textColor: { isEnabled: boolean; value: string };
  bgColor: { isEnabled: boolean; value: string };
  padding: { isEnabled: boolean; value: string };
  borderRadius: { isEnabled: boolean; value: string; unit: string };
  fontWeight: { isEnabled: boolean; value: string };
  fontStyle: { isEnabled: boolean; value: string };
  textDecoration: { isEnabled: boolean; value: string };
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
    const hostname = window.location.hostname;
    rules.forEach((rule) => {
      if (rule.domain && rule.domain !== hostname) return;
      if (
        rule.isActive &&
        rule.fontFamily.isEnabled !== false &&
        rule.fontFamily.value
      ) {
        // Extract font name from possible CSS quotes, e.g. "'Inter', sans-serif" -> "Inter"
        const match = rule.fontFamily.value.match(/'?([^',]+)'?/);
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

  const buildInheritedCss = (rule: StyleRule): string => {
    let css = "";
    if (
      rule.fontFamily.isEnabled !== false &&
      rule.fontFamily.value &&
      rule.fontFamily.value !== "inherit"
    ) {
      css += `font-family: ${rule.fontFamily.value} !important;`;
    }
    if (rule.fontSize.isEnabled !== false && rule.fontSize.value) {
      css += `font-size: ${rule.fontSize.value}px !important;`;
    }
    if (rule.textColor.isEnabled !== false && rule.textColor.value) {
      css += `color: ${rule.textColor.value} !important;`;
    }
    if (rule.fontWeight.isEnabled !== false && rule.fontWeight.value) {
      css += `font-weight: ${rule.fontWeight.value} !important;`;
    }
    if (rule.fontStyle.isEnabled !== false && rule.fontStyle.value) {
      css += `font-style: ${rule.fontStyle.value} !important;`;
    }
    if (
      rule.textDecoration.isEnabled !== false &&
      rule.textDecoration.value
    ) {
      css += `text-decoration: ${rule.textDecoration.value} !important;`;
    }
    return css;
  };

  const applyStyleRules = (settings: any) => {
    observer.disconnect(); // Prevent infinite loops

    const rules: StyleRule[] = settings.rules || [];

    // Load needed web fonts
    loadFonts(rules);

    // To ensure only one instance exists, remove any previous style tags
    const existingTags = document.querySelectorAll("#site-magic-styles");
    existingTags.forEach(tag => tag.remove());

    const styleTag = document.createElement("style");
    styleTag.id = "site-magic-styles";
    (document.head || document.documentElement).appendChild(styleTag);

    let consolidatedCss = "";
    const hostname = window.location.hostname;
    rules.forEach((rule) => {
      if (!rule.isActive) return;
      if (rule.domain && rule.domain !== hostname) return;

      const target = rule.targetSelector || "";
      if (target && !isSelectorSafe(target)) return;
      const isGlobal = !target;
      const inheritedCss = buildInheritedCss(rule);

      // 1. Container Styles (Padding, Background, and Font/Color for the container itself)
      const containerSelector = isGlobal ? "html, body" : target;
      let containerCss = `${containerSelector} {`;

      // Structural properties (Container only)
      if (rule.bgColor.isEnabled !== false && rule.bgColor.value) {
        containerCss += `background-color: ${rule.bgColor.value} !important;`;
      }
      if (rule.padding.isEnabled !== false && rule.padding.value) {
        containerCss += `padding: ${rule.padding.value}px !important;`;
      }
      if (rule.borderRadius.isEnabled !== false && rule.borderRadius.value) {
        const unit = rule.borderRadius.unit || "px";
        containerCss += `border-radius: ${rule.borderRadius.value}${unit} !important;`;
      }

      // Inherited properties
      containerCss += inheritedCss;
      containerCss += "}\n";
      consolidatedCss += containerCss;

      // 2. Child Styles (Font, Color, etc. - Inherited stuff ONLY)
      if (inheritedCss) {
        const childSelector = isGlobal
          ? "p, span, div, h1, h2, h3, h4, h5, h6, a, li, td, th"
          : `${target} *`;
        consolidatedCss += `${childSelector} { ${inheritedCss} }\n`;
      }
    });

    styleTag.textContent = consolidatedCss;

    observer.observe(document.head, { childList: true }); // Reconnect
  };

  const getAndApplyStyleRules = () => {
    chrome.storage.sync.get(
      [
        "rules",
      ],
      (result: { [key: string]: any }) => {
        applyStyleRules(result);
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

  const MAX_SELECTOR_LENGTH = 500;
  const isSelectorSafe = (selector: string) =>
    selector.length <= MAX_SELECTOR_LENGTH &&
    !/[{}]/.test(selector) &&
    !/<\//.test(selector);

  const rgbToHex = (rgb: string): string | null => {
    const m = rgb.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(",").map((p) => p.trim());
    if (parts.length >= 4 && parseFloat(parts[3]) === 0) return null;
    const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
    const r = parseFloat(parts[0]);
    const g = parseFloat(parts[1]);
    const b = parseFloat(parts[2]);
    if ([r, g, b].some((v) => Number.isNaN(v))) return null;
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const parsePxValue = (cssVal: string): string | null => {
    const m = cssVal.trim().match(/^(-?\d+(?:\.\d+)?)px$/);
    return m ? String(Math.round(parseFloat(m[1]))) : null;
  };

  const parseRadius = (cssVal: string): { value: string; unit: string } | null => {
    const m = cssVal.trim().match(/^(-?\d+(?:\.\d+)?)(px|%)$/);
    if (!m) return null;
    return { value: String(Math.round(parseFloat(m[1]))), unit: m[2] };
  };

  const getComputedStyleForSelector = (selector: string) => {
    let el: Element | null = null;
    if (selector && selector.trim()) {
      if (!isSelectorSafe(selector)) return { status: "unsafe" as const };
      try {
        el = document.querySelector(selector);
      } catch {
        return { status: "invalid" as const };
      }
      if (!el) return { status: "not-found" as const };
    } else {
      el = document.body || document.documentElement;
    }
    if (!el) return { status: "not-found" as const };
    const cs = getComputedStyle(el as HTMLElement);

    const textHex = rgbToHex(cs.color);
    const bgHex = rgbToHex(cs.backgroundColor);
    const fontPx = parsePxValue(cs.fontSize);
    const padPx = parsePxValue(cs.paddingTop);
    const radius = parseRadius(cs.borderTopLeftRadius);

    const weightNum = parseInt(cs.fontWeight, 10);
    const fontWeight = !Number.isNaN(weightNum)
      ? weightNum >= 600 ? "bold" : "normal"
      : cs.fontWeight === "bold" ? "bold" : "normal";
    const textDec = (cs.textDecorationLine || cs.textDecoration || "").includes("underline")
      ? "underline"
      : "none";

    return {
      status: "success" as const,
      styles: {
        fontFamily: cs.fontFamily || "inherit",
        fontSize: fontPx,
        textColor: textHex,
        bgColor: bgHex,
        padding: padPx,
        borderRadius: radius,
        fontWeight,
        fontStyle: cs.fontStyle === "italic" ? "italic" : "normal",
        textDecoration: textDec,
      },
    };
  };

  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === "startPicking") {
      startPicking();
      sendResponse({ status: "success" });
    } else if (request.action === "getComputedStyles") {
      sendResponse(getComputedStyleForSelector(request.selector || ""));
    } else if (request.action === "getPageInfo") {
      sendResponse({ status: "success", hostname: window.location.hostname || null });
    } else if (request.action === "reapplyStyles") {
      if (request.rules) {
        applyStyleRules({ rules: request.rules });
      } else {
        getAndApplyStyleRules();
      }
      sendResponse({ status: "success" });
    }
    return true;
  });

  // Load initial styles
  getAndApplyStyleRules();

  // Reinforce styles on DOM updates
  const observer = new MutationObserver(() => {
    const style = document.getElementById("site-magic-styles");
    // If the style tag is gone from the head, trigger a full re-apply.
    if (!style) {
        getAndApplyStyleRules();
    }
  });

  observer.observe(document.head, { childList: true });
})();
