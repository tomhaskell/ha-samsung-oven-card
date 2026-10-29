import { Entities, CookingModeLabels } from "../consts.js";
import { getOvenIconSvg } from "./oven-icons.js";
const html = String.raw;

export function renderOvenPanel({ card, entityList }) {
  const cookingMode = card._state(Entities.cookingMode, entityList)?.state;
  const machineState = card._state(Entities.machineState, entityList)?.state?.toLowerCase() || "idle";

  const rawProgress = Number(card._state(Entities.progressPercent, entityList)?.state);
  const progress = isNaN(rawProgress) ? 0 : Math.min(100, Math.max(0, rawProgress));

  const arcLength = 187;
  const dashOffset = arcLength - (arcLength * progress) / 100;
  const timeRemaining = card._formatRemaining();

  const isMicrowave =
    Boolean(cookingMode) &&
    (cookingMode.toLowerCase().includes("micro_wave") || cookingMode.toLowerCase().includes("microwave"));
  const isActive = machineState === "active";

  const tempObj = card._state(Entities.temperature, entityList);
  const setpointObj = card._state(Entities.setpoint, entityList);

  const currentTemp = tempObj ? Number(tempObj.state) : NaN;
  const targetTemp = setpointObj ? Number(setpointObj.state) : NaN;
  const tempUnit = tempObj?.attributes?.unit_of_measurement || setpointObj?.attributes?.unit_of_measurement || "°C";

  let tempStatusClass = "neutral";
  let trendArrow = "";
  let arrowClass = "";
  let mainValue = "--";
  let mainUnit = "";
  let subDisplay = "";

  if (isMicrowave) {
    const powerObj = card._state(Entities.powerLevel, entityList) || card._state(Entities.power, entityList);
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

  return html`
    <div class="oven-panel">
      <div class="oven-mode-panel">
        <div class="oven-progress-wrapper">
          <svg class="progress-ring" viewBox="0 0 100 100">
            <circle class="progress-track" cx="50" cy="50" r="44" transform="rotate(148 50 50)" />
            <circle
              class="progress-bar ${machineState}"
              cx="50"
              cy="50"
              r="44"
              transform="rotate(148 50 50)"
              style="stroke-dashoffset: ${dashOffset};"
            />
          </svg>
          <div class="oven-mode ${machineState}">${getOvenIconSvg(cookingMode)}</div>
          <div class="oven-mode-name">
            ${card._hass.formatEntityState(card._state(Entities.cookingMode, entityList))}
          </div>
        </div>
      </div>
      <div class="oven-temp-area">
        <div class="temp-primary ${tempStatusClass}">
          <span class="temp-val">${mainValue}</span>${mainUnit ? html`<span class="temp-unit">${mainUnit}</span>` : ""}
          ${trendArrow ? html`<span class="temp-arrow ${arrowClass}">${trendArrow}</span>` : ""}
        </div>
        ${subDisplay ? html`<div class="temp-secondary">${subDisplay}</div>` : ""}
        <div class="oven-time-remaining">${timeRemaining}</div>
      </div>
    </div>
  `;
}
