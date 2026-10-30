const css = String.raw;

export const styles = css`
  :host {
    display: block;
  }
  ha-card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .card-header {
    padding: 16px 16px 0;
    font-size: var(--ha-font-size-l);
    line-height: var(--ha-line-height-expanded);
    display: inline-flex;
    .title {
      font-weight: bold;
      flex: stretch;
    }
    .finish {
      color: var(--green-color);
    }
    .cooking {
      color: var(--orange-color);
    }
    .preheat {
      color: var(--orange-color);
    }
    .ready {
      color: var(--blue-color);
    }
  }
  .content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  ha-select {
    width: 100%;
  }
  ha-slider {
    width: 100%;
    --mdc-theme-primary: var(--orange-color, #ff9800);
    --primary-color: var(--orange-color, #ff9800);
    --ha-slider-selected-color: var(--orange-color, #ff9800);
    --ha-slider-pin-color: var(--orange-color, #ff9800);
    --mdc-slider-active-track-color: var(--orange-color, #ff9800);
    --mdc-slider-thumb-color: var(--orange-color, #ff9800);
    --mdc-slider-value-indicator-color: var(--orange-color, #ff9800);
    --md-slider-active-track-color: var(--orange-color, #ff9800);
    --md-slider-focus-handle-color: var(--orange-color, #ff9800);
    --md-slider-hover-handle-color: var(--orange-color, #ff9800);
    --md-slider-selected-handle-color: var(--orange-color, #ff9800);
  }
  .input-slider-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .input-slider-header {
    display: flex;
    justify-content: space-between;
    font-size: var(--ha-font-size-s, 12px);
    color: var(--secondary-text-color);
  }
  .input-switch-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .oven-panel-container {
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.15));
    border-radius: var(--ha-card-border-radius, 12px);
    transition: background-color 0.2s ease;
  }
  .oven-panel-container.expanded {
    background-color: var(--secondary-background-color, rgba(127, 127, 127, 0.04));
  }
  .oven-panel {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    padding: 8px 12px 16px;
    gap: 16px;
    position: relative;
    border-radius: var(--ha-card-border-radius, 12px);
    user-select: none;
  }
  .oven-panel.clickable {
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  .oven-panel.clickable:hover {
    background-color: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
  }
  .expand-chevron {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--secondary-text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.6;
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }
  .oven-panel.clickable:hover .expand-chevron {
    opacity: 1;
    color: var(--primary-color, #03a9f4);
  }
  .oven-controls {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 4px 16px 16px;
    animation: fadeIn 0.2s ease-in-out;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .control-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .preset-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: space-between;
    margin-top: 6px;
  }
  .preset-btn {
    flex: 1;
    min-width: 58px;
    height: 32px;
    border-radius: 16px;
    border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
    background: var(--card-background-color, rgba(127, 127, 127, 0.06));
    color: var(--primary-text-color);
    font-size: var(--ha-font-size-s, 13px);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
  }
  .preset-btn:hover {
    background: var(--orange-color, #ff9800);
    color: #ffffff;
    border-color: var(--orange-color, #ff9800);
  }
  .preset-btn.active {
    background: var(--orange-color, #ff9800);
    color: #ffffff;
    border-color: var(--orange-color, #ff9800);
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(255, 152, 0, 0.35);
  }
  .expansion-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    margin-top: 6px;
    padding-top: 8px;
    border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.1));
  }
  .expansion-actions .action-spacer {
    flex: 1;
  }
  .expansion-actions .stop-btn {
    --mdc-theme-primary: var(--error-color, #f44336);
    color: var(--error-color, #f44336);
  }
  .expansion-actions .start-btn {
    --mdc-theme-primary: var(--primary-color, #03a9f4);
  }
  .expansion-actions .start-btn[disabled] {
    --mdc-theme-primary: var(--disabled-text-color, rgba(127, 127, 127, 0.4));
    background-color: var(--disabled-color, rgba(127, 127, 127, 0.2)) !important;
    color: var(--disabled-text-color, rgba(127, 127, 127, 0.5)) !important;
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
    box-shadow: none;
  }
  .expansion-actions ha-button ha-icon {
    --mdc-icon-size: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .expansion-actions .start-btn[disabled] {
    --mdc-theme-primary: var(--disabled-text-color, rgba(127, 127, 127, 0.4));
    background-color: var(--disabled-color, rgba(127, 127, 127, 0.2)) !important;
    color: var(--disabled-text-color, rgba(127, 127, 127, 0.5)) !important;
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
    box-shadow: none;
  }
  .expansion-actions ha-button ha-icon {
    --mdc-icon-size: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .oven-progress-wrapper {
    position: relative;
    width: 10em;
    height: 10em;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .oven-progress-wrapper .oven-mode {
    transform: translateY(-0.4em);
  }
  .progress-ring {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .progress-track {
    fill: none;
    stroke: var(--divider-color, rgba(127, 127, 127, 0.15));
    stroke-width: 10;
    stroke-linecap: round;
    stroke-dasharray: 187 276.46;
  }
  .progress-bar {
    fill: none;
    stroke: var(--orange-color, #ff9800);
    stroke-width: 10;
    stroke-linecap: round;
    stroke-dasharray: 187 276.46;
    transition: stroke-dashoffset 0.5s ease;
  }
  .progress-bar.ready,
  .progress-bar.idle {
    stroke: var(--blue-color, #2196f3);
  }
  .progress-bar.finish {
    stroke: var(--green-color, #4caf50);
  }
  .oven-time-remaining {
    font-size: var(--ha-font-size-xl);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--primary-text-color);
    letter-spacing: 0.5px;
    line-height: 1;
    text-align: center;
    padding-top: 10px;
  }
  .oven-mode svg {
    width: 5em;
    height: 5em;
  }
  .oven-mode.idle svg {
    color: var(--blue-color);
  }
  .oven-mode.active svg,
  .oven-mode.cooking svg {
    color: var(--orange-color);
  }
  .oven-mode-name {
    position: absolute;
    bottom: 1em;
    font-size: var(--ha-font-size-s, 13px);
    font-weight: bold;
    font-variant-numeric: tabular-nums;
    color: var(--primary-text-color);
    letter-spacing: 0.5px;
    line-height: 1;
    text-align: center;
  }

  .oven-temp-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 6em;
  }
  .temp-primary {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 2.8em;
    font-weight: 700;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }
  .temp-primary.below {
    color: var(--blue-color, #2196f3);
  }
  .temp-primary.above {
    color: var(--red-color, #f44336);
  }
  .temp-primary.at-target {
    color: var(--green-color, #4caf50);
  }
  .temp-primary.neutral {
    color: var(--primary-text-color);
  }
  .temp-unit {
    font-size: 0.45em;
    font-weight: 500;
    line-height: 1;
    margin-left: 2px;
    vertical-align: super;
  }
  .temp-secondary {
    font-size: var(--ha-font-size-s, 13px);
    color: var(--secondary-text-color);
    margin-top: 4px;
    font-weight: 500;
    text-align: center;
  }
  .temp-arrow {
    display: inline-flex;
    align-items: center;
    margin-left: 2px;
  }
  .temp-arrow ha-icon {
    --mdc-icon-size: 32px;
  }
  .temp-arrow.warming {
    color: var(--blue-color, #2196f3);
    animation: arrowUpBounce 1.4s infinite ease-in-out;
  }
  .temp-arrow.cooling {
    color: var(--red-color, #f44336);
    animation: arrowDownBounce 1.4s infinite ease-in-out;
  }
  @keyframes arrowUpBounce {
    0%,
    100% {
      transform: translateY(0);
      opacity: 0.7;
    }
    50% {
      transform: translateY(-5px);
      opacity: 1;
    }
  }
  @keyframes arrowDownBounce {
    0%,
    100% {
      transform: translateY(0);
      opacity: 0.7;
    }
    50% {
      transform: translateY(5px);
      opacity: 1;
    }
  }

  .bottom-icon-bar {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0px 8px 4px;
  }
  .icon-indicator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    color: var(--disabled-text-color, rgba(127, 127, 127, 0.4));
    transition:
      color 0.2s ease,
      background-color 0.2s ease,
      transform 0.1s ease;
    padding: 0;
    margin: 0;
    border: none;
    background: transparent;
    outline: none;
    box-sizing: border-box;
  }
  .icon-indicator ha-icon {
    --mdc-icon-size: 22px;
  }
  .icon-indicator.clickable {
    cursor: pointer;
  }
  .icon-indicator.clickable:hover {
    background-color: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
  }
  .icon-indicator.clickable:active {
    transform: scale(0.92);
    background-color: var(--secondary-background-color, rgba(127, 127, 127, 0.2));
  }
  .icon-indicator.active {
    color: var(--primary-color, #03a9f4);
  }
  .icon-indicator.active.lamp {
    color: var(--amber-color, #ffc107);
  }
  .icon-indicator.active.door {
    color: var(--warning-color, var(--orange-color, #ff9800));
  }
  .icon-indicator.active.lock {
    color: var(--orange-color, #ff9800);
  }
`;
