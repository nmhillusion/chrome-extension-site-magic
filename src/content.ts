interface StyleRule {
  id: string;
  name: string;
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
    rules.forEach((rule) => {
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



    let consolidatedCss = "";
    rules.forEach((rule) => {
      if (!rule.isActive) return;

      const target = rule.targetSelector || "";
      const isGlobal = !target;

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

      // Inherited properties (Applied to container as well)
      if (
        rule.fontFamily.isEnabled !== false &&
        rule.fontFamily.value &&
        rule.fontFamily.value !== "inherit"
      ) {
        containerCss += `font-family: ${rule.fontFamily.value} !important;`;
      }
      if (rule.fontSize.isEnabled !== false && rule.fontSize.value) {
        containerCss += `font-size: ${rule.fontSize.value}px !important;`;
      }
      if (rule.textColor.isEnabled !== false && rule.textColor.value) {
        containerCss += `color: ${rule.textColor.value} !important;`;
      }
      if (rule.fontWeight.isEnabled !== false && rule.fontWeight.value) {
        containerCss += `font-weight: ${rule.fontWeight.value} !important;`;
      }
      if (rule.fontStyle.isEnabled !== false && rule.fontStyle.value) {
        containerCss += `font-style: ${rule.fontStyle.value} !important;`;
      }
      if (
        rule.textDecoration.isEnabled !== false &&
        rule.textDecoration.value
      ) {
        containerCss += `text-decoration: ${rule.textDecoration.value} !important;`;
      }
      containerCss += "}\n";
      consolidatedCss += containerCss;

      // 2. Child Styles (Font, Color, etc. - Inherited stuff ONLY)
      const childSelector = isGlobal
        ? "p, span, div, h1, h2, h3, h4, h5, h6, a, li, td, th"
        : `${target} *`;

      let childCss = `${childSelector} {`;
      if (
        rule.fontFamily.isEnabled !== false &&
        rule.fontFamily.value &&
        rule.fontFamily.value !== "inherit"
      ) {
        childCss += `font-family: ${rule.fontFamily.value} !important;`;
      }
      if (rule.fontSize.isEnabled !== false && rule.fontSize.value) {
        childCss += `font-size: ${rule.fontSize.value}px !important;`;
      }
      if (rule.textColor.isEnabled !== false && rule.textColor.value) {
        childCss += `color: ${rule.textColor.value} !important;`;
      }
      if (rule.fontWeight.isEnabled !== false && rule.fontWeight.value) {
        childCss += `font-weight: ${rule.fontWeight.value} !important;`;
      }
      if (rule.fontStyle.isEnabled !== false && rule.fontStyle.value) {
        childCss += `font-style: ${rule.fontStyle.value} !important;`;
      }
      if (
        rule.textDecoration.isEnabled !== false &&
        rule.textDecoration.value
      ) {
        childCss += `text-decoration: ${rule.textDecoration.value} !important;`;
      }
      childCss += "}\n";
      consolidatedCss += childCss;
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
        "borderRadius",
        "borderRadiusUnit",
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

  // Reinforce styles on DOM updates
  const observer = new MutationObserver(() => {
    const style = document.getElementById("site-magic-styles");
    if (style && style.parentElement !== document.documentElement) {
      (document.head || document.documentElement).appendChild(style);
    }
  });

  observer.observe(document.documentElement, { childList: true });
})();
