/**
 * Attaches delegated event listeners and a DOM observer to automatically
 * populate options and handle service calls for all rendered inputs.
 *
 * @param {HTMLElement} container - Usually card.shadowRoot
 * @param {HTMLElement} card - The card instance with _entities and _hass
 */
export function attachInputListeners(container, card) {
  // Sync options/items and values onto elements whenever the DOM updates
  const syncInputs = () => {
    // Sync <ha-select> elements
    const selects = container.querySelectorAll("ha-select[data-options]");
    for (const select of selects) {
      try {
        const rawOpts = JSON.parse(select.dataset.options || "[]");
        // Modern Home Assistant accepts an array of { label, value } or strings
        select.options = rawOpts.map((opt) =>
          typeof opt === "object" ? opt : { label: opt, value: opt },
        );
      } catch (e) {
        console.error("Failed to parse options for ha-select", e);
      }
      if (select.dataset.value !== undefined) {
        select.value = select.dataset.value;
      }
    }

    // Sync <ha-combo-box> elements
    const combos = container.querySelectorAll("ha-combo-box[data-items]");
    for (const combo of combos) {
      try {
        combo.items = JSON.parse(combo.dataset.items || "[]");
      } catch (e) {
        console.error("Failed to parse items for ha-combo-box", e);
      }
      if (combo.dataset.value !== undefined) {
        combo.value = combo.dataset.value;
      }
    }
  };

  // Run immediately in case inputs are already in DOM
  syncInputs();

  // Automatically sync when shadowRoot.innerHTML is replaced
  const observer = new MutationObserver(() => {
    syncInputs();
  });
  observer.observe(container, { childList: true, subtree: true });

  // Handle select / combobox changes
  const handleSelect = (e) => {
    const draftTarget = e.target.closest("ha-select[data-draft-key]");
    if (draftTarget) {
      const panelId = draftTarget.dataset.panelId;
      const key = draftTarget.dataset.draftKey;
      const value = e.detail?.value ?? draftTarget.value;
      if (panelId && key && value) {
        card.setDraftValue(panelId, key, value, false);
      }
      return;
    }

    const target = e.target.closest(
      "ha-select[data-entity-key], ha-combo-box[data-entity-key]",
    );
    if (!target) return;

    const key = target.dataset.entityKey;
    const entityId = card._entities?.[key];
    const value = e.detail?.value ?? target.value;
    const current = card._state(key)?.state;

    // Prevent duplicate calls if both selected and change events fire
    if (target._lastDispatchedValue === value) return;
    target._lastDispatchedValue = value;

    if (entityId && value && value !== current) {
      const domain = entityId.split(".")[0];
      card._hass.callService(domain, "select_option", {
        entity_id: entityId,
        option: value,
      });
    }
  };

  container.addEventListener("selected", handleSelect);
  container.addEventListener("value-changed", handleSelect);

  // Live slider input tracking while dragging
  container.addEventListener("input", (e) => {
    const draftSlider = e.target.closest("ha-slider[data-draft-key]");
    if (draftSlider) {
      const panelId = draftSlider.dataset.panelId;
      const key = draftSlider.dataset.draftKey;
      const val = Number(draftSlider.value);
      if (panelId && key && !isNaN(val)) {
        card.setDraftValue(panelId, key, val, true);
      }
    }
  });

  container.addEventListener("change", (e) => {
    // If it's a draft slider, commit value on change
    const draftSlider = e.target.closest("ha-slider[data-draft-key]");
    if (draftSlider) {
      const panelId = draftSlider.dataset.panelId;
      const key = draftSlider.dataset.draftKey;
      const val = Number(draftSlider.value);
      if (panelId && key && !isNaN(val)) {
        card.setDraftValue(panelId, key, val, false);
      }
      return;
    }

    // If it's a select, handle it via handleSelect
    if (
      e.target.closest(
        "ha-select[data-entity-key], ha-combo-box[data-entity-key], ha-select[data-draft-key]",
      )
    ) {
      handleSelect(e);
      return;
    }

    // Handle sliders (<ha-slider> emits "change" on release)
    const slider = e.target.closest("ha-slider[data-entity-key]");
    if (slider) {
      const key = slider.dataset.entityKey;
      const entityId = card._entities?.[key];
      const value = Number(slider.value);
      const current = Number(card._state(key)?.state);

      if (entityId && !Number.isNaN(value) && value !== current) {
        const domain = entityId.split(".")[0];
        card._hass.callService(domain, "set_value", {
          entity_id: entityId,
          value,
        });
      }
      return;
    }

    // Handle switches (<ha-switch> emits "change")
    const sw = e.target.closest("ha-switch[data-entity-key]");
    if (sw) {
      const key = sw.dataset.entityKey;
      const entityId = card._entities?.[key];
      if (entityId) {
        const domain = entityId.split(".")[0];
        card._hass.callService(domain, sw.checked ? "turn_on" : "turn_off", {
          entity_id: entityId,
        });
      }
    }
  });

  // Handle buttons and toggles (<ha-button>, [data-action="toggle"])
  container.addEventListener("click", (e) => {
    // 1. Toggle panel expansion
    const togglePanelEl = e.target.closest("[data-action='toggle-panel']");
    if (togglePanelEl) {
      const panelId = togglePanelEl.dataset.panelId;
      if (panelId) {
        card.togglePanel(panelId);
        return;
      }
    }

    // 2. Cancel panel expansion
    const cancelBtn = e.target.closest("[data-action='cancel-panel']");
    if (cancelBtn) {
      const panelId = cancelBtn.dataset.panelId;
      if (panelId) {
        card.cancelPanel(panelId);
        return;
      }
    }

    // 3. Start cooking command
    const startBtn = e.target.closest("[data-action='start-cooking']");
    if (startBtn) {
      if (startBtn.hasAttribute("disabled") || startBtn.disabled) return;
      const panelId = startBtn.dataset.panelId;
      if (panelId) {
        card.startCooking(panelId);
        return;
      }
    }

    // 4. Stop cooking command
    const stopBtn = e.target.closest("[data-action='stop-cooking']");
    if (stopBtn) {
      const panelId = stopBtn.dataset.panelId;
      if (panelId) {
        card.stopCooking(panelId);
        return;
      }
    }

    // 4. Preset temperature buttons
    const tempBtn = e.target.closest("[data-set-temp]");
    if (tempBtn) {
      const panelId = tempBtn.dataset.panelId;
      const temp = Number(tempBtn.dataset.setTemp);
      if (panelId && !isNaN(temp)) {
        card.setDraftValue(panelId, "setpoint", temp, false);
        return;
      }
    }

    // 5. Preset time buttons
    const timeBtn = e.target.closest("[data-set-time]");
    if (timeBtn) {
      const panelId = timeBtn.dataset.panelId;
      const time = Number(timeBtn.dataset.setTime);
      if (panelId && !isNaN(time)) {
        card.setDraftValue(panelId, "cookTime", time, false);
        return;
      }
    }

    const toggleBtn = e.target.closest(
      "[data-action='toggle'][data-entity-key]",
    );
    if (toggleBtn) {
      const key = toggleBtn.dataset.entityKey;
      const entityId = card._entities?.[key];
      if (entityId) {
        card._hass.callService("homeassistant", "toggle", {
          entity_id: entityId,
        });
      }
      return;
    }

    const btn = e.target.closest("ha-button[data-entity-key]");
    if (!btn) return;

    const key = btn.dataset.entityKey;
    const entityId = card._entities?.[key];
    if (entityId) {
      const domain = entityId.split(".")[0];
      card._hass.callService(domain, "press", {
        entity_id: entityId,
      });
    }
  });
}
