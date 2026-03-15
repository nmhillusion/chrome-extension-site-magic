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
  const borderRadiusUnitSelect = document.getElementById(
    "border-radius-unit",
  ) as HTMLSelectElement;

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

    if (fontFamilySelect)
      fontFamilySelect.value = rule.fontFamily.value || "inherit";
    if (fontSizeInput) fontSizeInput.value = rule.fontSize.value || "16";
    if (fontSizeVal)
      fontSizeVal.textContent = `${rule.fontSize.value || "16"}px`;
    if (textColorInput)
      textColorInput.value = rule.textColor.value || "#333333";
    if (textColorVal)
      textColorVal.textContent = (
        rule.textColor.value || "#333333"
      ).toUpperCase();

    if (enableFontFamily)
      enableFontFamily.checked = rule.fontFamily.isEnabled !== false;
    if (enableFontSize)
      enableFontSize.checked = rule.fontSize.isEnabled !== false;
    if (enableTextColor)
      enableTextColor.checked = rule.textColor.isEnabled !== false;

    if (ruleNameInput) ruleNameInput.value = rule.name || "";

    if (enableBgColor) enableBgColor.checked = rule.bgColor.isEnabled !== false;

    if (enableFontFamily)
      updateGroupState(enableFontFamily, "group-font-family");
    if (enableFontSize) updateGroupState(enableFontSize, "group-font-size");
    if (enableTextColor) updateGroupState(enableTextColor, "group-text-color");
    if (enableBgColor) updateGroupState(enableBgColor, "group-bg-color");
    if (enablePadding) updateGroupState(enablePadding, "group-padding");

    if (bgColorInput) bgColorInput.value = rule.bgColor.value || "#ffffff";
    if (bgColorVal)
      bgColorVal.textContent = (rule.bgColor.value || "#ffffff").toUpperCase();

    if (paddingInput) paddingInput.value = rule.padding.value || "0";
    if (paddingVal) paddingVal.textContent = `${rule.padding.value || "0"}px`;

    if (enablePadding) enablePadding.checked = rule.padding.isEnabled !== false;

    if (borderRadiusInput)
      borderRadiusInput.value = rule.borderRadius.value || "0";
    if (borderRadiusUnitSelect)
      borderRadiusUnitSelect.value = rule.borderRadius.unit || "px";
    if (borderRadiusVal)
      borderRadiusVal.textContent = `${rule.borderRadius.value || "0"}${rule.borderRadius.unit || "px"}`;
    if (borderRadiusInput) {
      if (rule.borderRadius.unit === "%") {
        borderRadiusInput.max = "50";
      } else {
        borderRadiusInput.max = "100";
      }
    }
    if (enableBorderRadius)
      enableBorderRadius.checked = rule.borderRadius.isEnabled !== false;

    if (toggleBold)
      toggleBold.classList.toggle("active", rule.fontWeight.value === "bold");
    if (toggleItalic)
      toggleItalic.classList.toggle(
        "active",
        rule.fontStyle.value === "italic",
      );
    if (toggleUnderline)
      toggleUnderline.classList.toggle(
        "active",
        rule.textDecoration.value === "underline",
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
      fontFamily: { isEnabled: true, value: "inherit" },
      fontSize: { isEnabled: true, value: "16" },
      textColor: { isEnabled: true, value: "#333333" },
      bgColor: { isEnabled: true, value: "#ffffff" },
      padding: { isEnabled: true, value: "0" },
      borderRadius: { isEnabled: true, value: "0", unit: "px" },
      fontWeight: { isEnabled: true, value: "normal" },
      fontStyle: { isEnabled: true, value: "normal" },
      textDecoration: { isEnabled: true, value: "none" },
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

  // Load
  chrome.storage.sync.get(null, (result: any) => {
    if (result.rules && result.rules.length > 0) {
      rules = result.rules;
      activeRuleId = result.activeRuleId || rules[0].id;
    }
    if (activeRuleId) setActiveRule(activeRuleId);
  });

  // UI Listeners
  if (addRuleBtn) addRuleBtn.addEventListener("click", addRule);

  const updateActiveRuleState = () => {
    const rule = getActiveRule();
    if (!rule) return;

    rule.fontFamily.value = fontFamilySelect.value;
    rule.fontSize.value = fontSizeInput.value;
    rule.textColor.value = textColorInput.value;
    rule.bgColor.value = bgColorInput.value;
    rule.padding.value = paddingInput.value;
    rule.borderRadius.value = borderRadiusInput.value;
    rule.borderRadius.unit = borderRadiusUnitSelect.value;
    rule.fontFamily.isEnabled = enableFontFamily.checked;
    rule.fontSize.isEnabled = enableFontSize.checked;
    rule.textColor.isEnabled = enableTextColor.checked;
    rule.bgColor.isEnabled = enableBgColor.checked;
    rule.padding.isEnabled = enablePadding.checked;
    rule.borderRadius.isEnabled = enableBorderRadius.checked;
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
    borderRadiusUnitSelect,
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
      const rule = getActiveRule();
      const unit = borderRadiusUnitSelect
        ? borderRadiusUnitSelect.value
        : rule?.borderRadius.unit || "px";
      if (borderRadiusVal) borderRadiusVal.textContent = `${val}${unit}`;
      if (rule) {
        rule.borderRadius.value = val;
        notifyTabs(); // Live preview
      }
    });
  }

  if (borderRadiusUnitSelect) {
    borderRadiusUnitSelect.addEventListener("change", (e) => {
      const unit = (e.target as HTMLSelectElement).value;
      const rule = getActiveRule();
      if (rule) {
        rule.borderRadius.unit = unit;
        rule.borderRadius.value = "0"; // Reset value to 0 on unit change

        // Update UI
        if (borderRadiusInput) {
          borderRadiusInput.value = "0";
          if (unit === "px") {
            borderRadiusInput.max = "100";
          } else {
            borderRadiusInput.max = "50";
          }
        }
        if (borderRadiusVal) borderRadiusVal.textContent = `0${unit}`;

        debouncedSave();
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

    const currentConfig = rule[prop] as any;
    const newVal = currentConfig.value === activeVal ? normalVal : activeVal;
    currentConfig.value = newVal;
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
        rule.fontSize.value = val;
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
        rule.padding.value = val;
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
        rule.textColor.value = val;
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
        rule.bgColor.value = val;
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
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0 && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "startPicking" }, () => {
             if (chrome.runtime.lastError) {
                console.error("Error sending message to tab: ", chrome.runtime.lastError);
                // Optionally reset UI if failed
                if (pickingStatus) pickingStatus.textContent = "Error: Please reload the page.";
                pickerBtn.disabled = false;
                pickerBtn.style.opacity = "1";
             }
          });
          if (pickingStatus) pickingStatus.textContent = "● Picking...";
          pickerBtn.disabled = true;
          pickerBtn.style.opacity = "0.5";
        } else {
          console.warn("Could not find an active tab to start picking.");
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
      // Ask user to confirm reset to avoid accidental clicks
      const confirmed = window.confirm(
        "Reset this rule to defaults? This will undo any unsaved changes.",
      );
      if (!confirmed) return;

      const rule = getActiveRule();
      if (rule) {
        rule.fontFamily.value = "inherit";
        rule.fontSize.value = "16";
        rule.textColor.value = "#333333";
        rule.bgColor.value = "#ffffff";
        rule.padding.value = "0";
        rule.borderRadius.value = "0";
        rule.borderRadius.unit = "px";
        rule.fontFamily.isEnabled = true;
        rule.fontSize.isEnabled = true;
        rule.textColor.isEnabled = true;
        rule.bgColor.isEnabled = true;
        rule.padding.isEnabled = true;
        rule.borderRadius.isEnabled = true;
        rule.targetSelector = "";
        setActiveRule(rule.id);
        saveToStorage();
      }
    });
  }
});
