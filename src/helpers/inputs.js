const html = String.raw;

/**
 * Renders a Home Assistant select dropdown (<ha-select>)
 *
 * @param {Object} options
 * @param {HTMLElement} options.card - Card instance with _state() and _entities
 * @param {string} options.entityKey - Key from Entities enum
 * @param {string} [options.label] - Optional select header label override
 * @param {Object.<string, string>} [options.labels] - Optional map of item values to display labels (e.g. CookingModeLabels)
 * @param {boolean} [options.disabled=false]
 */
export function renderSelect({
  card,
  entityKey,
  label,
  labels,
  disabled = false,
}) {
  const stateObj = card._state(entityKey);
  if (!stateObj) return "";

  const options = stateObj.attributes?.options || [];
  const current = stateObj.state;
  const selectLabel = label || stateObj.attributes?.friendly_name || "";

  const items = options.map((opt) => {
    const value = typeof opt === "object" ? opt.value : opt;
    const optLabel =
      labels?.[value] ?? (typeof opt === "object" ? opt.label : opt);
    return { value, label: optLabel };
  });

  const optionsJson = JSON.stringify(items).replace(/"/g, "&quot;");

  return html`
    <ha-select
      label="${selectLabel}"
      value="${current}"
      data-value="${current}"
      data-options="${optionsJson}"
      data-entity-key="${entityKey}"
      data-input-type="select"
      ${disabled ? "disabled" : ""}
      fixedMenuPosition
      naturalMenuWidth
    >
      ${items
        .map(
          (item) => html`
            <ha-list-item
              value="${item.value}"
              ${item.value === current ? "selected" : ""}
            >
              ${item.label}
            </ha-list-item>
          `,
        )
        .join("")}
    </ha-select>
  `;
}

/**
 * Renders a Home Assistant combobox dropdown (<ha-combo-box>)
 *
 * @param {Object} options
 * @param {HTMLElement} options.card - Card instance with _state() and _entities
 * @param {string} options.entityKey - Key from Entities enum
 * @param {string} [options.label] - Optional combobox header label override
 * @param {Object.<string, string>} [options.labels] - Optional map of item values to display labels (e.g. CookingModeLabels)
 * @param {boolean} [options.disabled=false]
 */
export function renderComboBox({
  card,
  entityKey,
  label,
  labels,
  disabled = false,
}) {
  const stateObj = card._state(entityKey);
  if (!stateObj) return "";

  const rawOptions = stateObj.attributes?.options || [];
  const current = stateObj.state;
  const comboLabel = label || stateObj.attributes?.friendly_name || "";
  const items = rawOptions.map((opt) => {
    const value = typeof opt === "object" ? opt.value : opt;
    const optLabel =
      labels?.[value] ?? (typeof opt === "object" ? opt.label : opt);
    return { label: optLabel, value };
  });
  const itemsJson = JSON.stringify(items).replace(/"/g, "&quot;");

  return html`
    <ha-combo-box
      label="${comboLabel}"
      value="${current}"
      data-value="${current}"
      data-items="${itemsJson}"
      data-entity-key="${entityKey}"
      data-input-type="combobox"
      ${disabled ? "disabled" : ""}
    ></ha-combo-box>
  `;
}

/**
 * Renders a Home Assistant slider (<ha-slider>)
 *
 * @param {Object} options
 * @param {HTMLElement} options.card - Card instance with _state() and _entities
 * @param {string} options.entityKey - Key from Entities enum
 * @param {string} [options.label] - Optional label override
 * @param {number} [options.min] - Minimum value (defaults to entity attribute or 0)
 * @param {number} [options.max] - Maximum value (defaults to entity attribute or 100)
 * @param {number} [options.step] - Step value (defaults to entity attribute or 1)
 * @param {boolean} [options.disabled=false]
 */
export function renderSlider({
  card,
  entityKey,
  label,
  min,
  max,
  step,
  disabled = false,
}) {
  const stateObj = card._state(entityKey);
  if (!stateObj) return "";

  const attr = stateObj.attributes || {};
  const sliderMin = min ?? attr.min ?? 0;
  const sliderMax = max ?? attr.max ?? 100;
  const sliderStep = step ?? attr.step ?? 1;
  const unit = attr.unit_of_measurement || "";
  const sliderLabel = label || attr.friendly_name || "";

  return html`
    <div class="input-slider-wrapper">
      <div class="input-slider-header">
        <span class="input-slider-label">${sliderLabel}</span>
        <span class="input-slider-value">${stateObj.state} ${unit}</span>
      </div>
      <ha-slider
        pin
        labeled
        min="${sliderMin}"
        max="${sliderMax}"
        step="${sliderStep}"
        value="${stateObj.state}"
        data-entity-key="${entityKey}"
        data-input-type="slider"
        ${disabled ? "disabled" : ""}
      ></ha-slider>
    </div>
  `;
}

/**
 * Renders a Home Assistant switch toggle (<ha-switch>)
 *
 * @param {Object} options
 * @param {HTMLElement} options.card - Card instance with _state() and _entities
 * @param {string} options.entityKey - Key from Entities enum
 * @param {string} [options.label] - Optional label override
 * @param {boolean} [options.disabled=false]
 */
export function renderSwitch({ card, entityKey, label, disabled = false }) {
  const stateObj = card._state(entityKey);
  if (!stateObj) return "";

  const isChecked = stateObj.state === "on";
  const switchLabel = label || stateObj.attributes?.friendly_name || "";

  return html`
    <div class="input-switch-wrapper">
      <span class="input-switch-label">${switchLabel}</span>
      <ha-switch
        ${isChecked ? "checked" : ""}
        data-entity-key="${entityKey}"
        data-input-type="switch"
        ${disabled ? "disabled" : ""}
      ></ha-switch>
    </div>
  `;
}

/**
 * Renders a Home Assistant button (<ha-button>)
 *
 * @param {Object} options
 * @param {HTMLElement} options.card - Card instance with _state() and _entities
 * @param {string} options.entityKey - Key from Entities enum
 * @param {string} options.label - Button text
 * @param {string} [options.icon] - Optional MDI icon (e.g. "mdi:play")
 * @param {boolean} [options.raised=false]
 * @param {boolean} [options.disabled=false]
 */
export function renderButton({
  card,
  entityKey,
  label,
  icon,
  raised = false,
  disabled = false,
}) {
  const stateObj = card._state(entityKey);
  if (!stateObj) return "";

  return html`
    <ha-button
      data-entity-key="${entityKey}"
      data-input-type="button"
      ${raised ? "raised" : ""}
      ${disabled ? "disabled" : ""}
    >
      ${icon ? html`<ha-icon icon="${icon}" slot="icon"></ha-icon>` : ""}
      ${label}
    </ha-button>
  `;
}

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
