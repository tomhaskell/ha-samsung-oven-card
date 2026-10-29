const html = String.raw;

export function isLocalThingsDevice(dev, hass) {
  if (!dev) return false;

  // 1. Check identifiers (e.g. [["localthings", "..."]])
  if (Array.isArray(dev.identifiers)) {
    const hasIdentifier = dev.identifiers.some(([domain]) => {
      const d = String(domain).toLowerCase();
      return d.includes("localthings") || d.includes("local_things");
    });
    if (hasIdentifier) return true;
  }

  // 2. Check manufacturer / model
  const manufacturer = (dev.manufacturer || "").toLowerCase();
  if (
    manufacturer.includes("localthings") ||
    manufacturer.includes("local_things")
  ) {
    return true;
  }

  // 3. Check entity platforms for this device
  if (hass?.entities) {
    const hasLtEntity = Object.values(hass.entities).some((entry) => {
      const devId = entry.device_id || entry.di;
      if (devId !== dev.id) return false;
      const platform = String(entry.platform || entry.pl || "").toLowerCase();
      return (
        platform.includes("localthings") || platform.includes("local_things")
      );
    });
    if (hasLtEntity) return true;
  }

  return false;
}

export function getLocalThingsOvenDevices(hass) {
  if (!hass?.devices) return [];

  const allDevices = Object.values(hass.devices);

  // Primary: LocalThings devices with 'oven' in the name (case-insensitive)
  let devices = allDevices.filter((dev) => {
    const name = (dev.name || "").toLowerCase();
    return (
      isLocalThingsDevice(dev, hass) &&
      name.includes("oven") &&
      !name.includes("subdevice")
    );
  });

  // Fallback 1: Any LocalThings devices
  if (!devices.length) {
    devices = allDevices.filter((dev) => isLocalThingsDevice(dev, hass));
  }

  // Fallback 2: Any device with 'oven' in the name
  if (!devices.length) {
    devices = allDevices.filter((dev) => {
      const name = (dev.name_by_user || dev.name || "").toLowerCase();
      return name.includes("oven") && !name.includes("subdevice");
    });
  }

  return devices.map((dev) => ({
    value: dev.id,
    label: dev.name_by_user || dev.name || dev.id,
  }));
}

export function renderField(id, label) {
  if (customElements.get("ha-input")) {
    return html`<ha-input id="${id}" label="${label}"></ha-input>`;
  }
  if (customElements.get("ha-textfield")) {
    return html`<ha-textfield id="${id}" label="${label}"></ha-textfield>`;
  }
  if (customElements.get("mwc-textfield")) {
    return html`<mwc-textfield id="${id}" label="${label}"></mwc-textfield>`;
  }
  return html`
    <div class="ha-textfield-fallback">
      <label for="${id}">${label}</label>
      <input type="text" id="${id}" />
    </div>
  `;
}

class SamsungOvenCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
    this._initialized = false;
  }

  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _valueChanged(field, value) {
    if (!this._config) return;
    if (this._config[field] === value) return;

    const newConfig = {
      ...this._config,
    };

    if (value === "" || value === undefined) {
      delete newConfig[field];
    } else {
      newConfig[field] = value;
    }

    this._config = newConfig;

    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      }),
    );
  }

  _render() {
    if (!this._hass) return;

    if (!this._initialized) {
      this.shadowRoot.innerHTML = html`
        <style>
          .card-config {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 8px 0;
          }
          ha-select,
          ha-textfield,
          ha-input,
          mwc-textfield {
            width: 100%;
          }
          .ha-textfield-fallback {
            display: flex;
            flex-direction: column;
            gap: 4px;
            width: 100%;
          }
          .ha-textfield-fallback label {
            font-size: var(--ha-font-size-s, 12px);
            color: var(--secondary-text-color);
            font-weight: 500;
          }
          .ha-textfield-fallback input {
            width: 100%;
            padding: 10px 12px;
            border-radius: 4px;
            border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
            background: var(
              --input-fill-color,
              var(--secondary-background-color, rgba(127, 127, 127, 0.08))
            );
            color: var(--primary-text-color);
            font-size: var(--ha-font-size-m, 14px);
            box-sizing: border-box;
            outline: none;
            transition: border-color 0.2s ease;
          }
          .ha-textfield-fallback input:focus {
            border-color: var(--primary-color, #03a9f4);
          }
          .help-text {
            font-size: var(--ha-font-size-s, 12px);
            color: var(--secondary-text-color);
            margin-top: -8px;
          }
          .warning-text {
            font-size: var(--ha-font-size-s, 12px);
            color: var(--warning-color, #ff9800);
            margin-top: -8px;
          }
        </style>
        <div class="card-config">
          <ha-select
            id="device-picker"
            label="Oven Device"
            fixedMenuPosition
            naturalMenuWidth
          ></ha-select>
          <div id="device-help" class="help-text"></div>
          ${renderField("title-input", "Card Title (Optional)")}
          ${renderField(
            "temperatures-input",
            "Standard Temperatures (e.g. 160, 180, 200, 220)",
          )}
          ${renderField(
            "times-input",
            "Standard Cook Times (minutes, e.g. 15, 30, 60, 90)",
          )}
        </div>
      `;

      const select = this.shadowRoot.querySelector("#device-picker");
      const handleSelect = (ev) => {
        const val = ev.detail?.value ?? ev.target?.value;
        if (val !== undefined) {
          this._valueChanged("device_id", val);
        }
      };
      select?.addEventListener("selected", handleSelect);
      select?.addEventListener("change", handleSelect);
      select?.addEventListener("closed", (e) => e.stopPropagation());

      const titleInput = this.shadowRoot.querySelector("#title-input");
      const handleTitle = (ev) => {
        this._valueChanged("title", ev.target.value);
      };
      titleInput?.addEventListener("input", handleTitle);
      titleInput?.addEventListener("change", handleTitle);

      const tempsInput = this.shadowRoot.querySelector("#temperatures-input");
      const handleTemps = (ev) => {
        this._valueChanged("standard_temperatures", ev.target.value);
      };
      tempsInput?.addEventListener("input", handleTemps);
      tempsInput?.addEventListener("change", handleTemps);

      const timesInput = this.shadowRoot.querySelector("#times-input");
      const handleTimes = (ev) => {
        this._valueChanged("standard_times", ev.target.value);
      };
      timesInput?.addEventListener("input", handleTimes);
      timesInput?.addEventListener("change", handleTimes);

      this._initialized = true;
    }

    // Resolve oven devices
    const devices = getLocalThingsOvenDevices(this._hass);
    if (
      this._config?.device_id &&
      !devices.some((i) => i.value === this._config.device_id)
    ) {
      const currentDev = this._hass.devices[this._config.device_id];
      devices.unshift({
        value: this._config.device_id,
        label: currentDev
          ? currentDev.name_by_user || currentDev.name
          : this._config.device_id,
      });
    }

    const select = this.shadowRoot.querySelector("#device-picker");
    if (select) {
      // Slotted <ha-list-item> elements for older HA versions
      select.innerHTML = devices
        .map(
          (dev) => html`
            <ha-list-item
              value="${dev.value}"
              ${dev.value === this._config?.device_id ? "selected" : ""}
            >
              ${dev.label}
            </ha-list-item>
          `,
        )
        .join("");

      // .options property for modern HA versions
      select.options = devices;
      select.value = this._config?.device_id || "";
    }

    const helpEl = this.shadowRoot.querySelector("#device-help");
    if (helpEl) {
      if (devices.length === 0) {
        helpEl.className = "warning-text";
        helpEl.textContent =
          "No LocalThings devices with 'oven' in their name were found.";
      } else {
        helpEl.className = "help-text";
        helpEl.textContent = `Found ${devices.length} oven device${devices.length === 1 ? "" : "s"}.`;
      }
    }

    const titleInput = this.shadowRoot.querySelector("#title-input");
    if (titleInput && titleInput.value !== (this._config?.title || "")) {
      titleInput.value = this._config?.title || "";
    }

    const tempsInput = this.shadowRoot.querySelector("#temperatures-input");
    if (tempsInput) {
      const val = Array.isArray(this._config?.standard_temperatures)
        ? this._config.standard_temperatures.join(", ")
        : this._config?.standard_temperatures || "";
      if (tempsInput.value !== val) {
        tempsInput.value = val;
      }
    }

    const timesInput = this.shadowRoot.querySelector("#times-input");
    if (timesInput) {
      const val = Array.isArray(this._config?.standard_times)
        ? this._config.standard_times.join(", ")
        : this._config?.standard_times || "";
      if (timesInput.value !== val) {
        timesInput.value = val;
      }
    }
  }
}

if (!customElements.get("samsung-oven-card-editor")) {
  customElements.define("samsung-oven-card-editor", SamsungOvenCardEditor);
}
