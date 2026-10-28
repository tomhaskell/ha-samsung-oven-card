import { SUFFIXES, Entities, CookingModeLabels } from "./consts.js";
import { renderSelect, attachInputListeners } from "./helpers/inputs.js";
import { getOvenIconSvg } from "./oven-icons.js";
const html = String.raw;
import { styles } from "./styles.js";

const VERSION = "0.0.1";

class SamsungOvenCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }); // Creates this.shadowRoot
    this._entities = null;
    this._signature = "";
    this._discovering = false;
    this._title = "";
    this._timer = null;
    attachInputListeners(this.shadowRoot, this);
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
      return "--:--";
    }

    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(raw)) {
      return raw;
    }

    const finishDate = new Date(raw);
    if (isNaN(finishDate.getTime())) {
      return "--:--";
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
      return "--:--";
    }

    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(raw)) {
      return raw;
    }

    const finishDate = new Date(raw);
    if (isNaN(finishDate.getTime())) {
      return "--:--";
    }

    const diffSec = Math.max(0, Math.floor((finishDate.getTime() - Date.now()) / 1000));
    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  // Called with the YAML configuration of the card. Throw an
  // error and Home Assistant shows it instead of the card.
  setConfig(config) {
    if (!config.device_id) {
      throw new Error("No device selected");
    }
    this._config = config;
    this._entities = null;
    this._signature = "";
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

  // find all the entity ids we need based on the device config
  async _discover() {
    this._discovering = true;
    this._render();
    try {
      const entitiesArray = Object.values(this._hass.entities);

      const ids = entitiesArray
        .filter((entry) => {
          const device = entry.di || entry.device_id;
          return device === this._config.device_id;
        })
        .map((entry) => entry.ei || entry.entity_id)
        .filter(Boolean);
      this._entities = {};
      for (const [key, suffix] of Object.entries(SUFFIXES)) {
        const id = ids.find((candidate) => candidate.endsWith(suffix));
        if (id) this._entities[key] = id;
      }
      console.debug(this._entities);
    } catch (error) {
      console.error("samsung-oven-card discovery failed", error);
      this._entities = {};
    } finally {
      this._discovering = false;
      this._render();
    }
  }

  // return the state object associated with the given key
  _state(key) {
    const id = this._entities?.[key];
    return id ? this._hass?.states?.[id] : undefined;
  }

  // wrap the provided html content in a card element and add stylesheet
  _frame(content) {
    return `
    <style>${styles}</style>
    <ha-card>${content}</ha-card>`;
  }

  // generate the HTML for displaying the card
  _render() {
    if (!this._config || !this._hass) {
      this.innerHTML = this._frame(
        `<div class="message"><span class="spinner"></span>Loading...</div>`,
      );
      return;
    }
    if (!this._entities || !Object.keys(this._entities).length) {
      this.innerHTML = this._frame(
        `<div class="message error"><ha-icon icon="mdi:alert-circle-outline"></ha-icon>No content</div>`,
      );
      return;
    }

    var content = "";
    for (const e in this._entities) {
      const stateObj = this._state(e);
      console.debug(stateObj);
      content += e + ":" + this._hass.formatEntityState(stateObj) + `<br />`;
    }

    const cookingMode = this._state(Entities.cookingMode)?.state;
    const machineState =
      this._state(Entities.machineState)?.state?.toLowerCase() || "idle";

    const rawProgress = Number(this._state(Entities.progressPercent)?.state);
    const progress = isNaN(rawProgress)
      ? 0
      : Math.min(100, Math.max(0, rawProgress));

    // 270-degree arc leaving a 90-degree gap at the bottom (circumference 276.46 * 0.75 = 207.35)
    const arcLength = 207.35;
    const dashOffset = arcLength - (arcLength * progress) / 100;
    const timeRemaining = this._formatRemaining();

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
        ${renderSelect({
          card: this,
          entityKey: Entities.cookingMode,
          label: "Cooking Mode",
          labels: CookingModeLabels,
        })}
        <div class="card-section">
          <div class="oven-progress-wrapper">
            <svg class="progress-ring" viewBox="0 0 100 100">
              <circle
                class="progress-track"
                cx="50"
                cy="50"
                r="44"
                transform="rotate(135 50 50)"
              />
              <circle
                class="progress-bar ${machineState}"
                cx="50"
                cy="50"
                r="44"
                transform="rotate(135 50 50)"
                style="stroke-dashoffset: ${dashOffset};"
              />
            </svg>
            <div class="oven-mode ${machineState}">
              ${getOvenIconSvg(cookingMode)}
            </div>
            <div class="oven-time-remaining">${timeRemaining}</div>
          </div>
        </div>
        ${content}
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

console.info(
  `%c SAMSUNG-OVEN-CARD %c ${VERSION} `,
  "color:#fff;background:#f57c00;font-weight:700",
  "color:#f57c00;background:#fff;font-weight:700",
);
