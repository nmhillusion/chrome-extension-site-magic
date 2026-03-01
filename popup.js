document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const fontFamilySelect = document.getElementById("font-family");
  const fontSizeInput = document.getElementById("font-size");
  const fontSizeVal = document.getElementById("font-size-val");
  const textColorInput = document.getElementById("text-color");
  const textColorVal = document.getElementById("text-color-val");

  const enableFontFamily = document.getElementById("enable-font-family");
  const enableFontSize = document.getElementById("enable-font-size");
  const enableTextColor = document.getElementById("enable-text-color");

  const pickerBtn = document.getElementById("picker-btn");
  const clearTargetBtn = document.getElementById("clear-target-btn");
  const targetInput = document.getElementById("target-input");
  const pickingStatus = document.getElementById("picking-status");
  const copySelectorBtn = document.getElementById("copy-selector-btn");

  const rulesList = document.getElementById("rules-list");
  const addRuleBtn = document.getElementById("add-rule-btn");

  const applyBtn = document.getElementById("apply-btn");
  const resetBtn = document.getElementById("reset-btn");

  // State
  let rules = [];
  let activeRuleId = null;

  const updateGroupState = (checkbox, groupId) => {
    const group = document.getElementById(groupId);
    if (checkbox.checked) {
      group.classList.remove("disabled");
    } else {
      group.classList.add("disabled");
    }
  };

  const generateId = () =>
    "site-magic-" + Math.random().toString(36).substr(2, 9);

  const getActiveRule = () => rules.find((r) => r.id === activeRuleId);

  const renderRules = () => {
    rulesList.innerHTML = "";
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
        if (e.target.classList.contains("delete-rule-btn")) return;
        setActiveRule(rule.id);
      });

      card.querySelector(".delete-rule-btn").addEventListener("click", (e) => {
        deleteRule(rule.id);
      });

      rulesList.appendChild(card);
    });
  };

  const setActiveRule = (id) => {
    activeRuleId = id;
    const rule = getActiveRule();
    if (!rule) return;

    fontFamilySelect.value = rule.fontFamily || "inherit";
    fontSizeInput.value = rule.fontSize || "16";
    fontSizeVal.textContent = `${fontSizeInput.value}px`;
    textColorInput.value = rule.textColor || "#333333";
    textColorVal.textContent = textColorInput.value.toUpperCase();

    enableFontFamily.checked = rule.isFontFamilyEnabled !== false;
    enableFontSize.checked = rule.isFontSizeEnabled !== false;
    enableTextColor.checked = rule.isTextColorEnabled !== false;

    updateGroupState(enableFontFamily, "group-font-family");
    updateGroupState(enableFontSize, "group-font-size");
    updateGroupState(enableTextColor, "group-text-color");

    targetInput.value = rule.targetSelector || "";
    if (!rule.targetSelector) {
      targetInput.placeholder = "Global (All Elements)";
    }

    renderRules();
  };

  const saveToStorage = () => {
    chrome.storage.sync.set({ rules, activeRuleId });
  };

  const addRule = () => {
    const newRule = {
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

  const deleteRule = (id) => {
    rules = rules.filter((r) => r.id !== id);
    if (activeRuleId === id) {
      activeRuleId = rules.length > 0 ? rules[0].id : null;
    }
    if (activeRuleId) {
      setActiveRule(activeRuleId);
    } else {
      // If no rules left, clear UI or add a default
      addRule();
    }
    saveToStorage();
    renderRules();
  };

  // Load and Migrate
  chrome.storage.sync.get(null, (result) => {
    if (result.rules && result.rules.length > 0) {
      rules = result.rules;
      activeRuleId = result.activeRuleId || rules[0].id;
    } else {
      // Migration from legacy single-rule
      const legacyRule = {
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
    setActiveRule(activeRuleId);
  });

  // UI Listeners
  addRuleBtn.addEventListener("click", addRule);

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
    el.addEventListener("change", updateActiveRuleState);
  });

  fontSizeInput.addEventListener("input", (e) => {
    fontSizeVal.textContent = `${e.target.value}px`;
    updateActiveRuleState();
  });

  textColorInput.addEventListener("input", (e) => {
    textColorVal.textContent = e.target.value.toUpperCase();
    updateActiveRuleState();
  });

  targetInput.addEventListener("input", (e) => {
    const rule = getActiveRule();
    if (rule) {
      rule.targetSelector = e.target.value;
      saveToStorage();
      renderRules(); // Update preview in card
    }
  });

  pickerBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "startPicking" });
      pickingStatus.textContent = "● Picking...";
      pickerBtn.disabled = true;
      pickerBtn.style.opacity = "0.5";
    });
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "pickingComplete") {
      pickingStatus.textContent = "";
      pickerBtn.disabled = false;
      pickerBtn.style.opacity = "1";

      if (message.selector) {
        const rule = getActiveRule();
        if (rule) {
          rule.targetSelector = message.selector;
          targetInput.value = rule.targetSelector;
          saveToStorage();
          renderRules();
        }
      }
    }
  });

  // Sync from storage (e.g. from content script picker)
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync" && changes.rules) {
      rules = changes.rules.newValue;
      renderRules();
      const rule = getActiveRule();
      if (rule) {
        targetInput.value = rule.targetSelector || "";
      }
    }
  });

  copySelectorBtn.addEventListener("click", () => {
    if (targetInput.value) {
      navigator.clipboard.writeText(targetInput.value).then(() => {
        const originalText = copySelectorBtn.textContent;
        copySelectorBtn.textContent = "✅";
        setTimeout(() => {
          copySelectorBtn.textContent = originalText;
        }, 1500);
      });
    }
  });

  clearTargetBtn.addEventListener("click", () => {
    const rule = getActiveRule();
    if (rule) {
      rule.targetSelector = "";
      targetInput.value = "";
      targetInput.placeholder = "Global (All Elements)";
      saveToStorage();
      renderRules();
    }
  });

  applyBtn.addEventListener("click", () => {
    updateActiveRuleState();
    applyBtn.textContent = "Applied!";
    applyBtn.style.background = "#10b981";
    setTimeout(() => {
      applyBtn.textContent = "Save Changes";
      applyBtn.style.background = "";
    }, 1500);
  });

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
});
