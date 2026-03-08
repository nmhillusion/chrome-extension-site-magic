interface StyleRule {
  id: string;
  name: string;
  targetSelector: string;
  fontFamily: string;
  fontSize: string;
  textColor: string;
  bgColor: string;
  padding: string;
  borderRadius: string;
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
  isFontFamilyEnabled: boolean;
  isFontSizeEnabled: boolean;
  isTextColorEnabled: boolean;
  isBgColorEnabled: boolean;
  isPaddingEnabled: boolean;
  isBorderRadiusEnabled: boolean;
  isFontWeightEnabled: boolean;
  isFontStyleEnabled: boolean;
  isTextDecorationEnabled: boolean;
  isActive: boolean;
}

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const fontFamilySelect = document.getElementById(
    "font-family",
  ) as HTMLSelectElement;
  const fontSizeInput = document.getElementById(
    "font-size",
  ) as HTMLInputElement;
  const fontSizeVal = document.getElementById("font-size-val") as HTMLElement;
  const textColorInput = document.getElementById(
    "text-color",
  ) as HTMLInputElement;
  const textColorVal = document.getElementById("text-color-val") as HTMLElement;

  const enableFontFamily = document.getElementById(
    "enable-font-family",
  ) as HTMLInputElement;
  const enableFontSize = document.getElementById(
    "enable-font-size",
  ) as HTMLInputElement;
  const enableTextColor = document.getElementById(
    "enable-text-color",
  ) as HTMLInputElement;
  const bgColorInput = document.getElementById("bg-color") as HTMLInputElement;
  const bgColorVal = document.getElementById("bg-color-val") as HTMLElement;
  const enableBgColor = document.getElementById(
    "enable-bg-color",
  ) as HTMLInputElement;
  const paddingInput = document.getElementById("padding") as HTMLInputElement;
  const paddingVal = document.getElementById("padding-val") as HTMLElement;
  const enablePadding = document.getElementById(
    "enable-padding",
  ) as HTMLInputElement;

  const borderRadiusInput = document.getElementById(
    "border-radius",
  ) as HTMLInputElement;
  const borderRadiusVal = document.getElementById(
    "border-radius-val",
  ) as HTMLElement;
  const enableBorderRadius = document.getElementById(
    "enable-border-radius",
  ) as HTMLInputElement;

  const toggleBold = document.getElementById(
    "toggle-bold",
  ) as HTMLButtonElement;
  const toggleItalic = document.getElementById(
    "toggle-italic",
  ) as HTMLButtonElement;
  const toggleUnderline = document.getElementById(
    "toggle-underline",
  ) as HTMLButtonElement;

  const pickerBtn = document.getElementById("picker-btn") as HTMLButtonElement;
  const clearTargetBtn = document.getElementById(
    "clear-target-btn",
  ) as HTMLButtonElement;
  const targetInput = document.getElementById(
    "target-input",
  ) as HTMLTextAreaElement;
  const pickingStatus = document.getElementById(
    "picking-status",
  ) as HTMLElement;
  const copySelectorBtn = document.getElementById(
    "copy-selector-btn",
  ) as HTMLButtonElement;
  const ruleNameInput = document.getElementById(
    "rule-name-input",
  ) as HTMLInputElement;

  const rulesList = document.getElementById("rules-list") as HTMLElement;
  const addRuleBtn = document.getElementById(
    "add-rule-btn",
  ) as HTMLButtonElement;

  const applyBtn = document.getElementById("apply-btn") as HTMLButtonElement;
  const resetBtn = document.getElementById("reset-btn") as HTMLButtonElement;

  // State
  let rules: StyleRule[] = [];
  let activeRuleId: string | null = null;

  const updateGroupState = (checkbox: HTMLInputElement, groupId: string) => {
    const group = document.getElementById(groupId);
    if (group) {
      if (checkbox.checked) {
        group.classList.remove("disabled");
      } else {
        group.classList.add("disabled");
      }
    }
  };

  const generateId = () =>
    "site-magic-" + Math.random().toString(36).substring(2, 11);

  const getActiveRule = () => rules.find((r) => r.id === activeRuleId);

  const renderRules = () => {
    if (rulesList) rulesList.innerHTML = "";
    rules.forEach((rule) => {
      const card = document.createElement("div");
      card.className = `rule-card ${rule.id === activeRuleId ? "active" : ""}`;
      card.innerHTML = `
        <div class="rule-info">
          <span class="rule-name">${rule.name || "Untitled Rule"}</span>
          <span class="rule-selector-preview">${rule.targetSelector || "Global (All Elements)"}</span>
        </div>
        <div class="rule-actions">
          <button class="delete-rule-btn" data-id="${rule.id}" title="Delete Rule">🗑️</button>
        </div>
      `;

      card.addEventListener("click", (e) => {
        if ((e.target as HTMLElement).classList.contains("delete-rule-btn"))
          return;
        setActiveRule(rule.id);
      });

      const deleteBtn = card.querySelector(".delete-rule-btn");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          deleteRule(rule.id);
        });
      }

      rulesList.appendChild(card);
    });
  };

  const setActiveRule = (id: string) => {
    activeRuleId = id;
    const rule = getActiveRule();
    if (!rule) return;

    if (fontFamilySelect) fontFamilySelect.value = rule.fontFamily || "inherit";
    if (fontSizeInput) fontSizeInput.value = rule.fontSize || "16";
    if (fontSizeVal) fontSizeVal.textContent = `${rule.fontSize || "16"}px`;
    if (textColorInput) textColorInput.value = rule.textColor || "#333333";
    if (textColorVal)
      textColorVal.textContent = (rule.textColor || "#333333").toUpperCase();

    if (enableFontFamily)
      enableFontFamily.checked = rule.isFontFamilyEnabled !== false;
    if (enableFontSize)
      enableFontSize.checked = rule.isFontSizeEnabled !== false;
    if (enableTextColor)
      enableTextColor.checked = rule.isTextColorEnabled !== false;

    if (ruleNameInput) ruleNameInput.value = rule.name || "";

    if (enableBgColor) enableBgColor.checked = rule.isBgColorEnabled !== false;

    if (enableFontFamily)
      updateGroupState(enableFontFamily, "group-font-family");
    if (enableFontSize) updateGroupState(enableFontSize, "group-font-size");
    if (enableTextColor) updateGroupState(enableTextColor, "group-text-color");
    if (enableBgColor) updateGroupState(enableBgColor, "group-bg-color");
    if (enablePadding) updateGroupState(enablePadding, "group-padding");

    if (bgColorInput) bgColorInput.value = rule.bgColor || "#ffffff";
    if (bgColorVal)
      bgColorVal.textContent = (rule.bgColor || "#ffffff").toUpperCase();

    if (paddingInput) paddingInput.value = rule.padding || "0";
    if (paddingVal) paddingVal.textContent = `${rule.padding || "0"}px`;

    if (enablePadding) enablePadding.checked = rule.isPaddingEnabled !== false;

    if (borderRadiusInput) borderRadiusInput.value = rule.borderRadius || "0";
    if (borderRadiusVal)
      borderRadiusVal.textContent = `${rule.borderRadius || "0"}%`;
    if (enableBorderRadius)
      enableBorderRadius.checked = rule.isBorderRadiusEnabled !== false;

    if (toggleBold)
      toggleBold.classList.toggle("active", rule.fontWeight === "bold");
    if (toggleItalic)
      toggleItalic.classList.toggle("active", rule.fontStyle === "italic");
    if (toggleUnderline)
      toggleUnderline.classList.toggle(
        "active",
        rule.textDecoration === "underline",
      );

    if (enableBorderRadius)
      updateGroupState(enableBorderRadius, "group-border-radius");

    if (targetInput) {
      targetInput.value = rule.targetSelector || "";
      if (!rule.targetSelector) {
        targetInput.placeholder = "Global (All Elements)";
      }
    }

    renderRules();
  };

  const notifyTabs = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "reapplyStyles", rules },
          () => {
            if (chrome.runtime.lastError) {
              const msg = chrome.runtime.lastError.message || "";
              if (msg.includes("Could not establish connection")) {
                console.warn(
                  "Site Magic: Page not ready. Please reload the page to apply styles.",
                );
              }
            }
          },
        );
      }
    });
  };

  const saveToStorage = (notify: boolean = true) => {
    chrome.storage.sync.set({ rules, activeRuleId }, () => {
      if (notify) notifyTabs();
    });
  };

  const addRule = () => {
    const newRule: StyleRule = {
      id: generateId(),
      name: `Style Rule ${rules.length + 1}`,
      targetSelector: "",
      fontFamily: "inherit",
      fontSize: "16",
      textColor: "#333333",
      bgColor: "#ffffff",
      padding: "0",
      borderRadius: "0",
      fontWeight: "normal",
      fontStyle: "normal",
      textDecoration: "none",
      isFontFamilyEnabled: true,
      isFontSizeEnabled: true,
      isTextColorEnabled: true,
      isBgColorEnabled: true,
      isPaddingEnabled: true,
      isBorderRadiusEnabled: true,
      isFontWeightEnabled: true,
      isFontStyleEnabled: true,
      isTextDecorationEnabled: true,
      isActive: true,
    };
    rules.push(newRule);
    setActiveRule(newRule.id);
    saveToStorage(true);
  };

  const deleteRule = (id: string) => {
    rules = rules.filter((r) => r.id !== id);
    if (activeRuleId === id) {
      activeRuleId = rules.length > 0 ? rules[0].id : null;
    }
    if (activeRuleId) {
      setActiveRule(activeRuleId);
    } else {
      addRule();
    }
    saveToStorage(true);
    renderRules();
  };

  // Load and Migrate
  chrome.storage.sync.get(null, (result: any) => {
    if (result.rules && result.rules.length > 0) {
      rules = result.rules;
      activeRuleId = result.activeRuleId || rules[0].id;
    } else {
      // Migration from legacy single-rule
      const legacyRule: StyleRule = {
        id: generateId(),
        name: "Primary Style",
        targetSelector: result.targetSelector || "",
        fontFamily: result.fontFamily || "inherit",
        fontSize: result.fontSize || "16",
        textColor: result.textColor || "#333333",
        bgColor: result.bgColor || "#ffffff",
        padding: result.padding || "0",
        borderRadius: result.borderRadius || "0",
        fontWeight: result.fontWeight || "normal",
        fontStyle: result.fontStyle || "normal",
        textDecoration: result.textDecoration || "none",
        isFontFamilyEnabled: result.isFontFamilyEnabled !== false,
        isFontSizeEnabled: result.isFontSizeEnabled !== false,
        isTextColorEnabled: result.isTextColorEnabled !== false,
        isBgColorEnabled: result.isBgColorEnabled !== false,
        isPaddingEnabled: result.isPaddingEnabled !== false,
        isBorderRadiusEnabled: result.isBorderRadiusEnabled !== false,
        isFontWeightEnabled: result.isFontWeightEnabled !== false,
        isFontStyleEnabled: result.isFontStyleEnabled !== false,
        isTextDecorationEnabled: result.isTextDecorationEnabled !== false,
        isActive: true,
      };
      rules = [legacyRule];
      activeRuleId = legacyRule.id;
      saveToStorage(false);
    }
    if (activeRuleId) setActiveRule(activeRuleId);
  });

  // UI Listeners
  if (addRuleBtn) addRuleBtn.addEventListener("click", addRule);

  const updateActiveRuleState = () => {
    const rule = getActiveRule();
    if (!rule) return;

    rule.fontFamily = fontFamilySelect.value;
    rule.fontSize = fontSizeInput.value;
    rule.textColor = textColorInput.value;
    rule.bgColor = bgColorInput.value;
    rule.padding = paddingInput.value;
    rule.borderRadius = borderRadiusInput.value;
    rule.isFontFamilyEnabled = enableFontFamily.checked;
    rule.isFontSizeEnabled = enableFontSize.checked;
    rule.isTextColorEnabled = enableTextColor.checked;
    rule.isBgColorEnabled = enableBgColor.checked;
    rule.isPaddingEnabled = enablePadding.checked;
    rule.isBorderRadiusEnabled = enableBorderRadius.checked;
    rule.targetSelector = targetInput.value;
    if (ruleNameInput) {
      rule.name = ruleNameInput.value;
    }
  };

  let debounceTimer: any;
  const debouncedSave = () => {
    clearTimeout(debounceTimer);
    updateActiveRuleState();
    renderRules(); // Update list immediately
    notifyTabs(); // Immediate live preview
    debounceTimer = setTimeout(() => {
      saveToStorage(true);
    }, 500);
  };

  [
    fontFamilySelect,
    fontSizeInput,
    textColorInput,
    enableFontFamily,
    enableFontSize,
    enableTextColor,
    bgColorInput,
    enableBgColor,
    paddingInput,
    enablePadding,
    borderRadiusInput,
    enableBorderRadius,
  ].forEach((el) => {
    if (el) el.addEventListener("change", debouncedSave);
  });

  if (enableBorderRadius) {
    enableBorderRadius.addEventListener("change", () =>
      updateGroupState(enableBorderRadius, "group-border-radius"),
    );
  }

  if (borderRadiusInput) {
    borderRadiusInput.addEventListener("input", (e) => {
      const val = (e.target as HTMLInputElement).value;
      if (borderRadiusVal) borderRadiusVal.textContent = `${val}%`;
      const rule = getActiveRule();
      if (rule) {
        rule.borderRadius = val;
        notifyTabs(); // Live preview
      }
    });
  }

  const toggleStyle = (
    btn: HTMLButtonElement,
    prop: keyof StyleRule,
    activeVal: string,
    normalVal: string,
  ) => {
    const rule = getActiveRule();
    if (!rule) return;

    const currentVal = rule[prop] as string;
    const newVal = currentVal === activeVal ? normalVal : activeVal;
    (rule as any)[prop] = newVal;
    btn.classList.toggle("active", newVal === activeVal);
    debouncedSave();
  };

  if (toggleBold) {
    toggleBold.addEventListener("click", () =>
      toggleStyle(toggleBold, "fontWeight", "bold", "normal"),
    );
  }
  if (toggleItalic) {
    toggleItalic.addEventListener("click", () =>
      toggleStyle(toggleItalic, "fontStyle", "italic", "normal"),
    );
  }
  if (toggleUnderline) {
    toggleUnderline.addEventListener("click", () =>
      toggleStyle(toggleUnderline, "textDecoration", "underline", "none"),
    );
  }

  if (enableFontFamily) {
    enableFontFamily.addEventListener("change", () =>
      updateGroupState(enableFontFamily, "group-font-family"),
    );
  }
  if (enableFontSize) {
    enableFontSize.addEventListener("change", () =>
      updateGroupState(enableFontSize, "group-font-size"),
    );
  }
  if (enableTextColor) {
    enableTextColor.addEventListener("change", () =>
      updateGroupState(enableTextColor, "group-text-color"),
    );
  }
  if (enableBgColor) {
    enableBgColor.addEventListener("change", () =>
      updateGroupState(enableBgColor, "group-bg-color"),
    );
  }
  if (enablePadding) {
    enablePadding.addEventListener("change", () =>
      updateGroupState(enablePadding, "group-padding"),
    );
  }

  if (fontSizeInput) {
    fontSizeInput.addEventListener("input", (e) => {
      const val = (e.target as HTMLInputElement).value;
      if (fontSizeVal) fontSizeVal.textContent = `${val}px`;
      const rule = getActiveRule();
      if (rule) {
        rule.fontSize = val;
        notifyTabs(); // Live preview
      }
    });
  }

  if (paddingInput) {
    paddingInput.addEventListener("input", (e) => {
      const val = (e.target as HTMLInputElement).value;
      if (paddingVal) paddingVal.textContent = `${val}px`;
      const rule = getActiveRule();
      if (rule) {
        rule.padding = val;
        notifyTabs(); // Live preview
      }
    });
  }

  if (textColorInput) {
    textColorInput.addEventListener("input", (e) => {
      const val = (e.target as HTMLInputElement).value;
      if (textColorVal) textColorVal.textContent = val.toUpperCase();
      const rule = getActiveRule();
      if (rule) {
        rule.textColor = val;
        notifyTabs(); // Live preview
      }
    });
  }

  if (bgColorInput) {
    bgColorInput.addEventListener("input", (e) => {
      const val = (e.target as HTMLInputElement).value;
      if (bgColorVal) bgColorVal.textContent = val.toUpperCase();
      const rule = getActiveRule();
      if (rule) {
        rule.bgColor = val;
        notifyTabs(); // Live preview
      }
    });
  }

  if (ruleNameInput) {
    ruleNameInput.addEventListener("input", () => {
      const rule = getActiveRule();
      if (rule) {
        rule.name = ruleNameInput.value;
        renderRules(); // Update list immediately
      }
    });
    ruleNameInput.addEventListener("change", debouncedSave);
  }

  if (targetInput) {
    targetInput.addEventListener("input", (e) => {
      const rule = getActiveRule();
      if (rule) {
        rule.targetSelector = (e.target as HTMLTextAreaElement).value;
        debouncedSave();
        renderRules();
      }
    });
  }

  if (pickerBtn) {
    pickerBtn.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "startPicking" });
          if (pickingStatus) pickingStatus.textContent = "● Picking...";
          pickerBtn.disabled = true;
          pickerBtn.style.opacity = "0.5";
        }
      });
    });
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "pickingComplete") {
      if (pickingStatus) pickingStatus.textContent = "";
      if (pickerBtn) {
        pickerBtn.disabled = false;
        pickerBtn.style.opacity = "1";
      }

      if (message.selector) {
        const rule = getActiveRule();
        if (rule) {
          rule.targetSelector = message.selector;
          if (targetInput) targetInput.value = rule.targetSelector;
          saveToStorage();
          renderRules();
        }
      }
    }
  });

  // Sync from storage
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync" && changes.rules) {
      rules = changes.rules.newValue as StyleRule[];
      renderRules();
      const rule = getActiveRule();
      if (rule && targetInput) {
        targetInput.value = rule.targetSelector || "";
      }
    }
  });

  if (copySelectorBtn) {
    copySelectorBtn.addEventListener("click", () => {
      if (targetInput && targetInput.value) {
        navigator.clipboard.writeText(targetInput.value).then(() => {
          const originalText = copySelectorBtn.textContent;
          copySelectorBtn.textContent = "✅";
          setTimeout(() => {
            copySelectorBtn.textContent = originalText;
          }, 1500);
        });
      }
    });
  }

  if (clearTargetBtn) {
    clearTargetBtn.addEventListener("click", () => {
      const rule = getActiveRule();
      if (rule) {
        rule.targetSelector = "";
        if (targetInput) {
          targetInput.value = "";
          targetInput.placeholder = "Global (All Elements)";
        }
        saveToStorage();
        renderRules();
      }
    });
  }

  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      updateActiveRuleState();
      const originalText = applyBtn.textContent;
      applyBtn.textContent = "Applied!";
      const originalBg = applyBtn.style.background;
      applyBtn.style.background = "#10b981";
      setTimeout(() => {
        applyBtn.textContent = originalText;
        applyBtn.style.background = originalBg;
      }, 1500);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const rule = getActiveRule();
      if (rule) {
        rule.fontFamily = "inherit";
        rule.fontSize = "16";
        rule.textColor = "#333333";
        rule.bgColor = "#ffffff";
        rule.padding = "0";
        rule.isFontFamilyEnabled = true;
        rule.isFontSizeEnabled = true;
        rule.isTextColorEnabled = true;
        rule.isBgColorEnabled = true;
        rule.isPaddingEnabled = true;
        rule.targetSelector = "";
        setActiveRule(rule.id);
        saveToStorage();
      }
    });
  }
});
