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
    .ready {
      color: var(--blue-color);
    }
  }
  .content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
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
  .card-section {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px 0;
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
    stroke-dasharray: 207.35 276.46;
  }
  .progress-bar {
    fill: none;
    stroke: var(--orange-color, #ff9800);
    stroke-width: 10;
    stroke-linecap: round;
    stroke-dasharray: 207.35 276.46;
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
    position: absolute;
    bottom: 0.35em;
    font-size: var(--ha-font-size-s, 13px);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--primary-text-color);
    letter-spacing: 0.5px;
    line-height: 1;
    text-align: center;
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
`;
