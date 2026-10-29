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
  .oven-panel {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    padding: 8px 12px 16px;
    gap: 16px;
    border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.15));
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
