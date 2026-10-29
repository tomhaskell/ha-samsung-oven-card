import { SUFFIXES, Entities, CookingModeLabels } from "./consts.js";
import { renderSelect, attachInputListeners } from "./helpers/inputs.js";
import { renderOvenPanel } from "./helpers/oven-panel.js";
import "./samsung-oven-card-editor.js";
const html = String.raw;
import { styles } from "./styles.js";

const VERSION = "0.0.1";

class SamsungOvenCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }); // Creates this.shadowRoot
    this._entities = null;
    this._subdevices = null;
    this._subdeviceEntities = null;
    this._signature = "";
    this._discovering = false;
    this._title = "";
    this._timer = null;
    this._expandedPanels = new Set();
    this._drafts = {};
    this._panelEntities = {};
    attachInputListeners(this.shadowRoot, this);
  }

  static getStubConfig(hass) {
    const devices = Object.values(hass?.devices || {});
    const match = devices.find((d) => {
      const name = (d.name_by_user || d.name || "").toLowerCase();
      const isLt =
        d.identifiers?.some(([domain]) =>
          String(domain).toLowerCase().includes("localthings"),
        ) ||
        d.manufacturer?.toLowerCase().includes("localthings") ||
        Object.values(hass?.entities || {}).some(
          (e) =>
            (e.device_id === d.id || e.di === d.id) &&
            String(e.platform || e.pl || "")
              .toLowerCase()
              .includes("localthings"),
        );
      return isLt && name.includes("oven");
    });
    return { device_id: match ? match.id : "" };
  }

  static async getConfigElement() {
    return document.createElement("samsung-oven-card-editor");
  }

  connectedCallback() {
    this._startTimer();
  }

  disconnectedCallback() {
    this._stopTimer();
  }

  _startTimer() {
    this._stopTimer();
    this._timer = setInterval(() => {
      const el = this.shadowRoot?.querySelector(".oven-time-remaining");
      if (el) {
        el.textContent = this._formatRemaining();
      }
    }, 1000);
  }

  _stopTimer() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  _formatRemaining() {
    const raw = this._state(Entities.estimatedFinish)?.state;
    if (!raw || raw === "unknown" || raw === "unavailable") {
      return "";
    }

    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(raw)) {
      return raw;
    }

    const finishDate = new Date(raw);
    if (isNaN(finishDate.getTime())) {
      return "";
    }

    const diffSec = Math.max(
      0,
      Math.floor((finishDate.getTime() - Date.now()) / 1000),
    );
    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  _getDraft(panelId, entityList) {
    if (!this._drafts) this._drafts = {};
    if (!this._drafts[panelId]) {
      const currentMode =
        this._state(Entities.cookingMode, entityList)?.state || "";
      const setpointObj = this._state(Entities.setpoint, entityList);
      const setpointVal = Number(setpointObj?.state);
      const cookTimeObj = this._state(Entities.cookTime, entityList);
      const cookTimeVal = Number(cookTimeObj?.state);

      this._drafts[panelId] = {
        cookingMode: currentMode,
        setpoint: !isNaN(setpointVal) && setpointVal > 0 ? setpointVal : 180,
        cookTime: !isNaN(cookTimeVal) && cookTimeVal > 0 ? cookTimeVal : 30,
      };
    }
    return this._drafts[panelId];
  }

  togglePanel(panelId) {
    if (!this._expandedPanels) this._expandedPanels = new Set();
    if (this._expandedPanels.has(panelId)) {
      this.cancelPanel(panelId);
    } else {
      this._expandedPanels.add(panelId);
      const entityList = this._panelEntities?.[panelId] || this._entities;
      this._getDraft(panelId, entityList);
      this._render();
    }
  }

  cancelPanel(panelId) {
    if (this._expandedPanels) this._expandedPanels.delete(panelId);
    if (this._drafts) delete this._drafts[panelId];
    this._render();
  }

  setDraftValue(panelId, key, value, isLiveInput = false) {
    if (!this._drafts) this._drafts = {};
    if (!this._drafts[panelId]) {
      const entityList = this._panelEntities?.[panelId] || this._entities;
      this._getDraft(panelId, entityList);
    }
    this._drafts[panelId][key] = value;

    if (isLiveInput) {
      const labelEl = this.shadowRoot.querySelector(
        `.input-slider-value[data-for="${key}"][data-panel-id="${panelId}"]`,
      );
      const slider = this.shadowRoot.querySelector(
        `ha-slider[data-draft-key="${key}"][data-panel-id="${panelId}"]`,
      );
      const unit = slider?.dataset.unit || "";
      if (labelEl) {
        labelEl.textContent = `${value} ${unit}`.trim();
      }
    } else {
      this._render();
    }
  }

  async startCooking(panelId) {
    const draft = this._drafts?.[panelId];
    const entityList = this._panelEntities?.[panelId] || this._entities;
    if (!draft || !this._hass || !entityList) return;

    try {
      // 1. Set cooking mode if provided and changed
      const modeId = entityList[Entities.cookingMode];
      if (modeId && draft.cookingMode) {
        const currentMode = this._state(
          Entities.cookingMode,
          entityList,
        )?.state;
        if (draft.cookingMode !== currentMode) {
          await this._hass.callService(modeId.split(".")[0], "select_option", {
            entity_id: modeId,
            option: draft.cookingMode,
          });
        }
      }

      // 2. Set setpoint temperature
      const setpointId = entityList[Entities.setpoint];
      if (setpointId && draft.setpoint !== undefined) {
        await this._hass.callService(setpointId.split(".")[0], "set_value", {
          entity_id: setpointId,
          value: Number(draft.setpoint),
        });
      }

      // 3. Set cook time
      const cookTimeId = entityList[Entities.cookTime];
      if (cookTimeId && draft.cookTime !== undefined) {
        await this._hass.callService(cookTimeId.split(".")[0], "set_value", {
          entity_id: cookTimeId,
          value: Number(draft.cookTime),
        });
      }

      // 4. Send start cooking command
      const startId = entityList[Entities.startCooking];
      if (startId) {
        const domain = startId.split(".")[0];
        const service = domain === "button" ? "press" : "turn_on";
        await this._hass.callService(domain, service, {
          entity_id: startId,
        });
      }
    } catch (err) {
      console.error("Failed to start oven cooking", err);
    } finally {
      this.cancelPanel(panelId);
    }
  }

  async stopCooking(panelId) {
    const entityList = this._panelEntities?.[panelId] || this._entities;
    if (!entityList || !this._hass) return;

    try {
      const stopId = entityList[Entities.stop];
      if (stopId) {
        const domain = stopId.split(".")[0];
        const service = domain === "button" ? "press" : "turn_off";
        await this._hass.callService(domain, service, {
          entity_id: stopId,
        });
      }
    } catch (err) {
      console.error("Failed to stop oven cooking", err);
    } finally {
      this.cancelPanel(panelId);
    }
  }

  // Called with the YAML configuration of the card. Throw an
  // error and Home Assistant shows it instead of the card.
  setConfig(config) {
    if (!config.device_id) {
      throw new Error("No device selected");
    }
    this._config = config;
    this._entities = null;
    this._subdevices = null;
    this._subdeviceEntities = null;
    this._signature = "";
    this._expandedPanels = new Set();
    this._drafts = {};
    this._render();
  }

  // Called with a new hass object on every change in the home.
  set hass(hass) {
    this._hass = hass;
    if (!this._entities && !this._discovering && this._config?.device_id)
      void this._discover();

    if (!this._config.title) {
      const dev = this._hass.devices[this._config.device_id];
      this._title = dev.name_by_user || dev.name;
    }

    // Only re-render if tracked entities have actually changed. Because HA updates
    // this setter on any state change in the home, comparing signatures avoids
    // unnecessary re-renders.
    const signature = this._stateSignature();
    if (signature !== this._signature) {
      this._signature = signature;
      this._render();
    }
  }

  // find all the entities for device `id` that match those found in `SUFFIXES`
  async _findEntities(dev_id) {
    const entitiesArray = Object.values(this._hass.entities);
    const ids = entitiesArray
      .filter((entry) => {
        const device = entry.di || entry.device_id;
        return device === dev_id;
      })
      .map((entry) => entry.ei || entry.entity_id)
      .filter(Boolean);
    const _entities = {};
    for (const [key, suffix] of Object.entries(SUFFIXES)) {
      const id = ids.find((candidate) => candidate.endsWith(suffix));
      if (id) _entities[key] = id;
    }
    return _entities;
  }

  // find all the entity ids we need based on the device config
  async _discover() {
    this._discovering = true;
    this._render();
    try {
      // find entity names
      this._entities = await this._findEntities(this._config.device_id);
      console.debug(this._entities);

      // check for subdevices (for dual-zone ovens)
      this._subdevices = {};
      let subdeviceFound = false;
      for (const dev of Object.values(this._hass.devices)) {
        if (dev.via_device_id && dev.via_device_id === this._config.device_id) {
          this._subdevices[dev.id] = dev;
          subdeviceFound = true;
        }
      }
      if (subdeviceFound) {
        console.debug(this._subdevices);
        // find subdevice entity names
        this._subdeviceEntities = {};
        for (const [id, subdevice] of Object.entries(this._subdevices)) {
          this._subdeviceEntities[id] = await this._findEntities(id);
        }
      }
      console.debug(this._subdeviceEntities);
    } catch (error) {
      console.error("samsung-oven-card discovery failed", error);
      this._entities = {};
    } finally {
      this._discovering = false;
      this._render();
    }
  }

  // return the state object associated with the given key
  _state(key, entityList = this._entities) {
    const id = entityList?.[key];
    return id ? this._hass?.states?.[id] : undefined;
  }

  // wrap the provided html content in a card element and add stylesheet
  _frame(content) {
    return html`
      <style>
        ${styles}
      </style>
      <ha-card>${content}</ha-card>
    `;
  }

  // generate the HTML for displaying the card
  _render() {
    if (!this._config || !this._hass) {
      this.innerHTML = this._frame(
        html`<div class="message">
          <span class="spinner"></span>Loading...
        </div>`,
      );
      return;
    }
    if (!this._entities || !Object.keys(this._entities).length) {
      this.innerHTML = this._frame(
        html`<div class="message error">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>No content
        </div>`,
      );
      return;
    }

    for (const e in this._entities) {
      const stateObj = this._state(e);
      console.debug(stateObj);
    }

    this._panelEntities = {};
    const mainPanelId =
      this._entities[Entities.machineState] ||
      this._entities[Entities.cookingMode] ||
      "main";
    this._panelEntities[mainPanelId] = this._entities;

    let subdeviceOvenPanels = "";
    if (this._subdevices) {
      // check available modes to see if it is in split mode
      const modes = this._state(Entities.cookingMode)?.attributes.options;
      let splitMode = false;
      for (const m of modes || []) {
        if (m.toLowerCase().startsWith("upper")) {
          splitMode = true;
          break;
        }
      }
      if (splitMode) {
        for (const id of Object.keys(this._subdevices)) {
          const subList = this._subdeviceEntities[id];
          const subPanelId =
            subList?.[Entities.machineState] ||
            subList?.[Entities.cookingMode] ||
            id;
          this._panelEntities[subPanelId] = subList;
          subdeviceOvenPanels += renderOvenPanel({
            card: this,
            entityList: subList,
          });
        }
      }
    }

    const smartControlObj = this._state(Entities.smartControl);
    const smartControlOn = smartControlObj?.state === "on";

    const childLockObj = this._state(Entities.childLock);
    const childLockOn =
      childLockObj?.state === "off" || childLockObj?.state === "locked";

    const doorObj = this._state(Entities.door);
    const doorOpen = doorObj?.state === "on" || doorObj?.state === "open";

    const soundObj = this._state(Entities.sound);
    const soundOn = soundObj?.state === "on";

    const lampObj = this._state(Entities.lamp);
    const lampOn = lampObj?.state === "on";

    this.shadowRoot.innerHTML = this._frame(html`
      <div class="card-header">
        <span class="title">${this._config.title || this._title}</span>
        <span
          class="${this._state(Entities.cavityState)?.state?.toLowerCase()}"
        >
          ${this._hass.formatEntityState(this._state(Entities.cavityState))}
        </span>
      </div>
      <div class="content">
        ${renderOvenPanel({ card: this, entityList: this._entities })}
        ${subdeviceOvenPanels}
        <div class="bottom-icon-bar">
          <div
            class="icon-indicator ${smartControlOn ? "active" : ""}"
            title="Smart Control: ${smartControlObj
              ? this._hass.formatEntityState(smartControlObj)
              : "off"}"
          >
            <ha-icon
              icon="${smartControlOn ? "mdi:remote" : "mdi:remote-off"}"
            ></ha-icon>
          </div>
          <div
            class="icon-indicator ${childLockOn ? "active lock" : ""}"
            title="Child Lock: ${childLockObj
              ? this._hass.formatEntityState(childLockObj)
              : "off"}"
          >
            <ha-icon
              icon="${childLockOn ? "mdi:lock" : "mdi:lock-open-variant"}"
            ></ha-icon>
          </div>
          <div
            class="icon-indicator ${doorOpen ? "active door" : ""}"
            title="Door: ${doorOpen ? "Open" : "Closed"}"
          >
            <ha-icon
              icon="${doorOpen ? "mdi:door-open" : "mdi:door-closed"}"
            ></ha-icon>
          </div>
          <button
            class="icon-indicator clickable ${soundOn ? "active" : ""}"
            data-action="toggle"
            data-entity-key="${Entities.sound}"
            title="Sound: ${soundOn ? "On" : "Off"} (Click to toggle)"
          >
            <ha-icon
              icon="${soundOn ? "mdi:volume-high" : "mdi:volume-off"}"
            ></ha-icon>
          </button>
          <button
            class="icon-indicator clickable ${lampOn ? "active lamp" : ""}"
            data-action="toggle"
            data-entity-key="${Entities.lamp}"
            title="Lamp: ${lampOn ? "On" : "Off"} (Click to toggle)"
          >
            <ha-icon
              icon="${lampOn ? "mdi:lightbulb" : "mdi:lightbulb-outline"}"
            ></ha-icon>
          </button>
        </div>
      </div>
    `);
  }

  // Height in the masonry view, in units of 50 pixels.
  getCardSize() {
    return 1;
  }

  // Size in the grid of the sections view.
  getGridOptions() {
    return { columns: 6, rows: 1, min_rows: 1 };
  }

  // Returns a serialized snapshot of tracked entity states and key attributes
  // (options, min, max, step) used to detect whether entity state has changed.
  _stateSignature() {
    if (!this._hass || !this._entities) return "";
    return JSON.stringify(
      Object.fromEntries(
        Object.entries(this._entities).map(([key, id]) => {
          const state = this._hass.states[id];
          return [
            key,
            state
              ? [
                  state.state,
                  state.attributes?.options,
                  state.attributes?.min,
                  state.attributes?.max,
                  state.attributes?.step,
                ]
              : null,
          ];
        }),
      ),
    );
  }
}

if (!customElements.get("samsung-oven-card"))
  customElements.define("samsung-oven-card", SamsungOvenCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "samsung-oven-card",
  name: "Samsung Oven Card",
  description:
    "Provides status and control of your LocalThings-connected Samsung Oven",
  preview: true,
  documentationURL: "https://github.com/tomhaskell/ha-samsung-oven-card",
});

console.info(
  `%c SAMSUNG-OVEN-CARD %c ${VERSION} `,
  "color:#fff;background:#f57c00;font-weight:700",
  "color:#f57c00;background:#fff;font-weight:700",
);
