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
  if (manufacturer.includes("localthings") || manufacturer.includes("local_things")) {
    return true;
  }

  // 3. Check entity platforms for this device
  if (hass?.entities) {
    const hasLtEntity = Object.values(hass.entities).some((entry) => {
      const devId = entry.device_id || entry.di;
      if (devId !== dev.id) return false;
      const platform = String(entry.platform || entry.pl || "").toLowerCase();
      return platform.includes("localthings") || platform.includes("local_things");
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
    return isLocalThingsDevice(dev, hass) && name.includes("oven") && !name.includes("subdevice");
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

export class SamsungOvenCardEditor extends HTMLElement {
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
      this.shadowRoot.innerHTML = `
        <style>
          .card-config {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 8px 0;
          }
          ha-select,
          ha-textfield {
            width: 100%;
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
          <ha-textfield
            id="title-input"
            label="Card Title (Optional)"
          ></ha-textfield>
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
      titleInput?.addEventListener("input", (ev) => {
        this._valueChanged("title", ev.target.value);
      });

      this._initialized = true;
    }

    // Resolve oven devices
    const devices = getLocalThingsOvenDevices(this._hass);
    if (this._config?.device_id && !devices.some((i) => i.value === this._config.device_id)) {
      const currentDev = this._hass.devices[this._config.device_id];
      devices.unshift({
        value: this._config.device_id,
        label: currentDev ? currentDev.name_by_user || currentDev.name : this._config.device_id,
      });
    }

    const select = this.shadowRoot.querySelector("#device-picker");
    if (select) {
      // Slotted <ha-list-item> elements for older HA versions
      select.innerHTML = devices
        .map(
          (dev) => `
            <ha-list-item value="${dev.value}" ${dev.value === this._config?.device_id ? "selected" : ""}>
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
        helpEl.textContent = "No LocalThings devices with 'oven' in their name were found.";
      } else {
        helpEl.className = "help-text";
        helpEl.textContent = `Found ${devices.length} oven device${devices.length === 1 ? "" : "s"}.`;
      }
    }

    const titleInput = this.shadowRoot.querySelector("#title-input");
    if (titleInput && titleInput.value !== (this._config?.title || "")) {
      titleInput.value = this._config?.title || "";
    }
  }
}

if (!customElements.get("samsung-oven-card-editor")) {
  customElements.define("samsung-oven-card-editor", SamsungOvenCardEditor);
}
