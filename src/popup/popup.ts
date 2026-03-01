interface StyleRule {
  id: string;
  name: string;
  targetSelector: string;
  fontFamily: string;
  fontSize: string;
  textColor: string;
  isFontFamilyEnabled: boolean;
  isFontSizeEnabled: boolean;
  isTextColorEnabled: boolean;
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

    if (enableFontFamily)
      updateGroupState(enableFontFamily, "group-font-family");
    if (enableFontSize) updateGroupState(enableFontSize, "group-font-size");
    if (enableTextColor) updateGroupState(enableTextColor, "group-text-color");

    if (targetInput) {
      targetInput.value = rule.targetSelector || "";
      if (!rule.targetSelector) {
        targetInput.placeholder = "Global (All Elements)";
      }
    }

    renderRules();
  };

  const saveToStorage = () => {
    chrome.storage.sync.set({ rules, activeRuleId });
  };

  const addRule = () => {
    const newRule: StyleRule = {
      id: generateId(),
      name: `Style Rule ${rules.length + 1}`,
      targetSelector: "",
      fontFamily: "inherit",
      fontSize: "16",
      textColor: "#333333",
      isFontFamilyEnabled: true,
      isFontSizeEnabled: true,
      isTextColorEnabled: true,
      isActive: true,
    };
    rules.push(newRule);
    setActiveRule(newRule.id);
    saveToStorage();
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
    saveToStorage();
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
        isFontFamilyEnabled: result.isFontFamilyEnabled !== false,
        isFontSizeEnabled: result.isFontSizeEnabled !== false,
        isTextColorEnabled: result.isTextColorEnabled !== false,
        isActive: true,
      };
      rules = [legacyRule];
      activeRuleId = legacyRule.id;
      saveToStorage();
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
    rule.isFontFamilyEnabled = enableFontFamily.checked;
    rule.isFontSizeEnabled = enableFontSize.checked;
    rule.isTextColorEnabled = enableTextColor.checked;
    rule.targetSelector = targetInput.value;

    saveToStorage();
  };

  [
    fontFamilySelect,
    fontSizeInput,
    textColorInput,
    enableFontFamily,
    enableFontSize,
    enableTextColor,
  ].forEach((el) => {
    if (el) el.addEventListener("change", updateActiveRuleState);
  });

  if (fontSizeInput) {
    fontSizeInput.addEventListener("input", (e) => {
      if (fontSizeVal)
        fontSizeVal.textContent = `${(e.target as HTMLInputElement).value}px`;
      updateActiveRuleState();
    });
  }

  if (textColorInput) {
    textColorInput.addEventListener("input", (e) => {
      if (textColorVal)
        textColorVal.textContent = (
          e.target as HTMLInputElement
        ).value.toUpperCase();
      updateActiveRuleState();
    });
  }

  if (targetInput) {
    targetInput.addEventListener("input", (e) => {
      const rule = getActiveRule();
      if (rule) {
        rule.targetSelector = (e.target as HTMLTextAreaElement).value;
        saveToStorage();
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
        rule.isFontFamilyEnabled = true;
        rule.isFontSizeEnabled = true;
        rule.isTextColorEnabled = true;
        rule.targetSelector = "";
        setActiveRule(rule.id);
        saveToStorage();
      }
    });
  }
});
