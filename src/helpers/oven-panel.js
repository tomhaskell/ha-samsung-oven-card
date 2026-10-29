import { Entities, CookingModeLabels } from "../consts.js";
import { getOvenIconSvg } from "./oven-icons.js";
const html = String.raw;

export function parseConfigList(val, fallback) {
  if (!val) return fallback;
  if (Array.isArray(val)) {
    const parsed = val
      .map((x) => Number(String(x).replace(/[^\d.-]/g, "")))
      .filter((n) => !isNaN(n));
    return parsed.length ? parsed : fallback;
  }
  if (typeof val === "string") {
    const parsed = val
      .split(/[,;\s]+/)
      .map((x) => Number(x.replace(/[^\d.-]/g, "")))
      .filter((n) => !isNaN(n));
    return parsed.length ? parsed : fallback;
  }
  return fallback;
}

export function renderOvenPanel({ card, entityList }) {
  const panelId =
    entityList?.[Entities.machineState] ||
    entityList?.[Entities.cookingMode] ||
    "main";
  const isExpanded = Boolean(
    card._expandedPanels && card._expandedPanels.has(panelId),
  );

  const cookingMode = card._state(Entities.cookingMode, entityList)?.state;
  const machineState =
    card._state(Entities.machineState, entityList)?.state?.toLowerCase() ||
    "idle";

  const rawProgress = Number(
    card._state(Entities.progressPercent, entityList)?.state,
  );
  const progress = isNaN(rawProgress)
    ? 0
    : Math.min(100, Math.max(0, rawProgress));

  const arcLength = 187;
  const dashOffset = arcLength - (arcLength * progress) / 100;
  const timeRemaining = card._formatRemaining();

  const isMicrowave =
    Boolean(cookingMode) &&
    (cookingMode.toLowerCase().includes("micro_wave") ||
      cookingMode.toLowerCase().includes("microwave"));
  const isActive = machineState === "active";

  const runningObj = card._state(Entities.running, entityList);
  const isRunning =
    runningObj?.state === "on" ||
    machineState === "active" ||
    machineState === "cooking" ||
    machineState === "preheat" ||
    machineState === "running";

  const smartControlObj =
    card._state(Entities.smartControl, entityList) ||
    card._state(Entities.smartControl);
  const isRemoteEnabled = smartControlObj
    ? smartControlObj.state === "on"
    : true;

  const tempObj = card._state(Entities.temperature, entityList);
  const setpointObj = card._state(Entities.setpoint, entityList);

  const currentTemp = tempObj ? Number(tempObj.state) : NaN;
  const targetTemp = setpointObj ? Number(setpointObj.state) : NaN;
  const tempUnit =
    tempObj?.attributes?.unit_of_measurement ||
    setpointObj?.attributes?.unit_of_measurement ||
    "°C";

  let tempStatusClass = "neutral";
  let trendArrow = "";
  let arrowClass = "";
  let mainValue = "--";
  let mainUnit = "";
  let subDisplay = "";

  if (isMicrowave) {
    const powerObj =
      card._state(Entities.powerLevel, entityList) ||
      card._state(Entities.power, entityList);
    const val = powerObj?.state ?? setpointObj?.state ?? "--";
    const unit =
      powerObj?.attributes?.unit_of_measurement ||
      setpointObj?.attributes?.unit_of_measurement ||
      (val !== "--" && !String(val).includes("W") ? "W" : "");
    mainValue = val;
    mainUnit = unit;
    if (isActive) {
      subDisplay =
        setpointObj && powerObj && setpointObj.state !== powerObj.state
          ? `Target: ${setpointObj.state} ${unit}`.trim()
          : "Power Level";
    }
  } else {
    if (!isNaN(currentTemp)) {
      mainValue = Math.round(currentTemp);
      mainUnit = tempUnit.startsWith("°") ? tempUnit : `°${tempUnit}`;
    } else if (tempObj?.state && tempObj.state != "unknown") {
      mainValue = tempObj.state;
    }

    if (isActive) {
      if (!isNaN(targetTemp) && targetTemp > 0) {
        const targetUnit = tempUnit.startsWith("°") ? tempUnit : `°${tempUnit}`;
        subDisplay = `Target: ${Math.round(targetTemp)}${targetUnit}`;

        if (!isNaN(currentTemp)) {
          const diff = currentTemp - targetTemp;
          const TEMP_THRESHOLD = 3;
          if (Math.abs(diff) <= TEMP_THRESHOLD) {
            tempStatusClass = "at-target";
          } else if (diff > TEMP_THRESHOLD) {
            tempStatusClass = "above";
            trendArrow = html`<ha-icon icon="mdi:arrow-down"></ha-icon>`;
            arrowClass = "cooling";
          } else {
            tempStatusClass = "below";
            trendArrow = html`<ha-icon icon="mdi:arrow-up"></ha-icon>`;
            arrowClass = "warming";
          }
        }
      } else if (setpointObj?.state) {
        subDisplay = `Target: ${card._hass.formatEntityState(setpointObj)}`;
      }
    }
  }

  // Expanded controls data
  let controlsHtml = "";
  if (isExpanded) {
    const draft = card._getDraft(panelId, entityList);

    // Standard presets (configurable)
    const standardTemps = parseConfigList(
      card._config?.standard_temperatures,
      [160, 180, 200, 220],
    );
    const standardTimes = parseConfigList(
      card._config?.standard_times,
      [15, 30, 60, 90],
    );

    // Cooking mode select options
    const cookingModeObj = card._state(Entities.cookingMode, entityList);
    const modeOptions = cookingModeObj?.attributes?.options || [];
    const currentDraftMode = draft.cookingMode || "";
    const modeItems = modeOptions.map((opt) => {
      const val = typeof opt === "object" ? opt.value : opt;
      const label =
        CookingModeLabels[val] || (typeof opt === "object" ? opt.label : opt);
      return { value: val, label };
    });
    const modeOptionsJson = JSON.stringify(modeItems).replace(/"/g, "&quot;");

    // Setpoint slider attributes
    const setpointAttr = setpointObj?.attributes || {};
    const setpointMin = setpointAttr.min ?? 40;
    const setpointMax = setpointAttr.max ?? 250;
    const setpointStep = setpointAttr.step ?? 5;
    const setpointUnit = tempUnit.startsWith("°") ? tempUnit : `°${tempUnit}`;
    const currentDraftSetpoint = draft.setpoint;

    // Cook time slider attributes
    const cookTimeObj = card._state(Entities.cookTime, entityList);
    const cookTimeAttr = cookTimeObj?.attributes || {};
    const cookTimeMin = cookTimeAttr.min ?? 1;
    // my oven goes to 24hours (1439mins) at which point the slider is unusable.
    // So cap it at 360mins or the max reported, whichever is lower
    const cookTimeMax = Math.min(cookTimeAttr.max ?? 360, 360);
    const cookTimeStep = cookTimeAttr.step ?? 1;
    const cookTimeUnit = cookTimeAttr.unit_of_measurement || "min";
    const currentDraftCookTime = draft.cookTime;

    controlsHtml = html`
      <div class="oven-controls" data-panel-id="${panelId}">
        ${modeItems.length > 0
          ? html`
              <div class="control-row">
                <ha-select
                  label="Cooking Mode"
                  value="${currentDraftMode}"
                  data-value="${currentDraftMode}"
                  data-options="${modeOptionsJson}"
                  data-panel-id="${panelId}"
                  data-draft-key="cookingMode"
                  fixedMenuPosition
                  naturalMenuWidth
                >
                  ${modeItems
                    .map(
                      (item) => html`
                        <ha-list-item
                          value="${item.value}"
                          ${item.value === currentDraftMode ? "selected" : ""}
                        >
                          ${item.label}
                        </ha-list-item>
                      `,
                    )
                    .join("")}
                </ha-select>
              </div>
            `
          : ""}

        <div class="control-row">
          <div class="input-slider-header">
            <span class="input-slider-label">Target Temperature</span>
            <span
              class="input-slider-value"
              data-for="setpoint"
              data-panel-id="${panelId}"
            >
              ${currentDraftSetpoint} ${setpointUnit}
            </span>
          </div>
          <ha-slider
            pin
            labeled
            min="${setpointMin}"
            max="${setpointMax}"
            step="${setpointStep}"
            value="${currentDraftSetpoint}"
            data-panel-id="${panelId}"
            data-draft-key="setpoint"
            data-unit="${setpointUnit}"
          ></ha-slider>
          <div class="preset-buttons">
            ${standardTemps
              .map(
                (temp) => html`
                  <button
                    type="button"
                    class="preset-btn ${Number(currentDraftSetpoint) ===
                    Number(temp)
                      ? "active"
                      : ""}"
                    data-panel-id="${panelId}"
                    data-set-temp="${temp}"
                  >
                    ${temp}°
                  </button>
                `,
              )
              .join("")}
          </div>
        </div>

        <div class="control-row">
          <div class="input-slider-header">
            <span class="input-slider-label">Cook Time</span>
            <span
              class="input-slider-value"
              data-for="cookTime"
              data-panel-id="${panelId}"
            >
              ${currentDraftCookTime} ${cookTimeUnit}
            </span>
          </div>
          <ha-slider
            pin
            labeled
            min="${cookTimeMin}"
            max="${cookTimeMax}"
            step="${cookTimeStep}"
            value="${currentDraftCookTime}"
            data-panel-id="${panelId}"
            data-draft-key="cookTime"
            data-unit="${cookTimeUnit}"
          ></ha-slider>
          <div class="preset-buttons">
            ${standardTimes
              .map(
                (t) => html`
                  <button
                    type="button"
                    class="preset-btn ${Number(currentDraftCookTime) ===
                    Number(t)
                      ? "active"
                      : ""}"
                    data-panel-id="${panelId}"
                    data-set-time="${t}"
                  >
                    ${t}min
                  </button>
                `,
              )
              .join("")}
          </div>
        </div>

        <div class="expansion-actions">
          ${isRunning
            ? html`
                <ha-button
                  class="stop-btn"
                  data-panel-id="${panelId}"
                  data-action="stop-cooking"
                >
                  <ha-icon icon="mdi:stop" slot="start"></ha-icon>
                  <ha-icon icon="mdi:stop" slot="icon"></ha-icon>
                  Stop
                </ha-button>
              `
            : ""}
          <div class="action-spacer"></div>
          <ha-button
            class="cancel-btn"
            data-panel-id="${panelId}"
            data-action="cancel-panel"
          >
            Cancel
          </ha-button>
          <ha-button
            class="start-btn"
            raised
            data-panel-id="${panelId}"
            data-action="start-cooking"
            ${!isRemoteEnabled ? "disabled" : ""}
            title="${!isRemoteEnabled
              ? "Remote control is disabled on the oven"
              : "Start cooking"}"
          >
            <ha-icon icon="mdi:play" slot="start"></ha-icon>
            <ha-icon icon="mdi:play" slot="icon"></ha-icon>
            Start
          </ha-button>
        </div>
      </div>
    `;
  }

  return html`
    <div class="oven-panel-container ${isExpanded ? "expanded" : ""}">
      <div
        class="oven-panel clickable ${isExpanded ? "active-expanded" : ""}"
        data-panel-id="${panelId}"
        data-action="toggle-panel"
        title="${isExpanded
          ? "Click to collapse"
          : "Click to set cooking controls"}"
      >
        <div class="oven-mode-panel">
          <div class="oven-progress-wrapper">
            <svg class="progress-ring" viewBox="0 0 100 100">
              <circle
                class="progress-track"
                cx="50"
                cy="50"
                r="44"
                transform="rotate(148 50 50)"
              />
              <circle
                class="progress-bar ${machineState}"
                cx="50"
                cy="50"
                r="44"
                transform="rotate(148 50 50)"
                style="stroke-dashoffset: ${dashOffset};"
              />
            </svg>
            <div class="oven-mode ${machineState}">
              ${getOvenIconSvg(cookingMode)}
            </div>
            <div class="oven-mode-name">
              ${card._hass.formatEntityState(
                card._state(Entities.cookingMode, entityList),
              )}
            </div>
          </div>
        </div>
        <div class="oven-temp-area">
          <div class="temp-primary ${tempStatusClass}">
            <span class="temp-val">${mainValue}</span>${mainUnit
              ? html`<span class="temp-unit">${mainUnit}</span>`
              : ""}
            ${trendArrow
              ? html`<span class="temp-arrow ${arrowClass}"
                  >${trendArrow}</span
                >`
              : ""}
          </div>
          ${subDisplay
            ? html`<div class="temp-secondary">${subDisplay}</div>`
            : ""}
          <div class="oven-time-remaining">${timeRemaining}</div>
        </div>
        <div class="expand-chevron">
          <ha-icon
            icon="${isExpanded ? "mdi:chevron-up" : "mdi:chevron-down"}"
          ></ha-icon>
        </div>
      </div>
      ${controlsHtml}
    </div>
  `;
}
