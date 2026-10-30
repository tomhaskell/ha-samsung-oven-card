// oven-icons.js

// Standard full-cavity outer frame (24x24 viewBox scaled to 70x70px viewport)
const FRAME =
  '<rect x="2.5" y="2.5" width="19" height="19" rx="2.5" stroke="currentColor" stroke-width="1.5" fill="none" />';

// Dual-zone truncated frames (75% height, capped by the dashed shelf line)
// Upper: solid top rounded corners, dashed base line at y = 17
const FRAME_UPPER_ZONE = `
  <path d="M 2.5 17 V 5 A 2.5 2.5 0 0 1 5 2.5 H 19 A 2.5 2.5 0 0 1 21.5 5 V 17" stroke="currentColor" stroke-width="1.5" fill="none" />
  <line x1="2.5" y1="17" x2="21.5" y2="17" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 1.5" />
`;

// Lower: solid bottom rounded corners, dashed ceiling line at y = 7
const FRAME_LOWER_ZONE = `
  <line x1="2.5" y1="7" x2="21.5" y2="7" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 1.5" />
  <path d="M 2.5 7 V 19 A 2.5 2.5 0 0 0 5 21.5 H 19 A 2.5 2.5 0 0 0 21.5 19 V 7" stroke="currentColor" stroke-width="1.5" fill="none" />
`;

// Full-cavity MDI 4-blade pinwheel fan centered at (12, 12)
const MDI_FAN = `
  <circle cx="12" cy="12" r="1.3" fill="currentColor" />
  <path fill="currentColor" d="
    M 12 10.7
    C 12 7.4 14.8 7.4 14.8 9.1
    C 14.8 10.8 13.2 10.8 12 10.7 Z
    M 13.3 12
    C 16.6 12 16.6 14.8 14.9 14.8
    C 13.2 14.8 13.2 13.2 13.3 12 Z
    M 12 13.3
    C 12 16.6 9.2 16.6 9.2 14.9
    C 9.2 13.2 10.8 13.2 12 13.3 Z
    M 10.7 12
    C 7.4 12 7.4 9.2 9.1 9.2
    C 10.8 9.2 10.8 10.8 10.7 12 Z
  " />
`;

// Upper active zone fan centered at (12, 10)
const MDI_FAN_UPPER = `
  <circle cx="12" cy="10" r="1.2" fill="currentColor" />
  <path fill="currentColor" d="
    M 12 8.8
    C 12 5.8 14.5 5.8 14.5 7.4
    C 14.5 8.9 13.1 8.9 12 8.8 Z
    M 13.2 10
    C 16.2 10 16.2 12.5 14.7 12.5
    C 13.1 12.5 13.1 11.1 13.2 10 Z
    M 12 11.2
    C 12 14.2 9.5 14.2 9.5 12.6
    C 9.5 11.1 10.9 11.1 12 11.2 Z
    M 10.8 10
    C 7.8 10 7.8 7.5 9.3 7.5
    C 10.9 7.5 10.9 8.9 10.8 10 Z
  " />
`;

// Lower active zone fan centered at (12, 14)
const MDI_FAN_LOWER = `
  <circle cx="12" cy="14" r="1.2" fill="currentColor" />
  <path fill="currentColor" d="
    M 12 12.8
    C 12 9.8 14.5 9.8 14.5 11.4
    C 14.5 12.9 13.1 12.9 12 12.8 Z
    M 13.2 14
    C 16.2 14 16.2 16.5 14.7 16.5
    C 13.1 16.5 13.1 15.1 13.2 14 Z
    M 12 15.2
    C 12 18.2 9.5 18.2 9.5 16.6
    C 9.5 15.1 10.9 15.1 12 15.2 Z
    M 10.8 14
    C 7.8 14 7.8 11.5 9.3 11.5
    C 10.9 11.5 10.9 12.9 10.8 14 Z
  " />
`;

const CIRCULAR_ELEMENT =
  '<circle cx="12" cy="12" r="6.2" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2 1.8" fill="none" />';
const TOP_BAR =
  '<line x1="5.5" y1="5.5" x2="18.5" y2="5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />';
const BOTTOM_BAR =
  '<line x1="5.5" y1="18.5" x2="18.5" y2="18.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />';
const FULL_GRILL =
  '<path d="M5.5 5.5l1.6 2.2 1.6-2.2 1.6 2.2 1.7-2.2 1.6 2.2 1.6-2.2 1.6 2.2 1.7-2.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" />';
const HALF_GRILL =
  '<path d="M8 5.5l1.6 2.2 1.6-2.2 1.6 2.2 1.6-2.2 1.6 2.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" />';
const MW_WAVES =
  '<path d="M6 10.5c1.5-1.1 3 1.1 4.5 0s3-1.1 4.5 0M6 13.5c1.5-1.1 3 1.1 4.5 0s3-1.1 4.5 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none" />';

const wrapSvg = (innerContent, frame = FRAME) =>
  `<svg viewBox="0 0 24 24" width="70" height="70" xmlns="http://www.w3.org/2000/svg">${frame}${innerContent}</svg>`;

export const OVEN_ICONS = {
  no_operation: wrapSvg(
    '<line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />',
  ),

  autocook: wrapSvg(`
    <path d="M7 15h10M7 12h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <path d="M15.5 8l1.4-1.4M16.8 10.8l1.6.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
    <circle cx="15.8" cy="9.4" r="1.1" fill="currentColor" />
  `),

  convection: wrapSvg(MDI_FAN),

  fan_conventional: wrapSvg(`${TOP_BAR}${BOTTOM_BAR}${MDI_FAN}`),

  conventional: wrapSvg(`${TOP_BAR}${BOTTOM_BAR}`),

  eco_convection: wrapSvg(`
    ${CIRCULAR_ELEMENT}${MDI_FAN}
    <text x="12" y="19" text-anchor="middle" font-size="3.8" font-family="Roboto, sans-serif" font-weight="900" fill="currentColor">ECO</text>
  `),

  large_grill: wrapSvg(FULL_GRILL),

  small_grill: wrapSvg(HALF_GRILL),

  fan_grill: wrapSvg(`${FULL_GRILL}${MDI_FAN}`),

  top_heat_plus_convection: wrapSvg(`${TOP_BAR}${MDI_FAN}`),

  bottom_heat_plus_convection: wrapSvg(`${BOTTOM_BAR}${MDI_FAN}`),

  bottom: wrapSvg(BOTTOM_BAR),

  micro_wave: wrapSvg(MW_WAVES),

  micro_wave_grill: wrapSvg(`
    ${FULL_GRILL}
    <path d="M6 14.5c1.5-1.1 3 1.1 4.5 0s3-1.1 4.5 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none" />
  `),

  micro_wave_convection: wrapSvg(`
    ${CIRCULAR_ELEMENT}${MDI_FAN}
    <path d="M7 17.5c1.2-.8 2.5.8 3.8 0s2.5-.8 3.8 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" fill="none" />
  `),

  air_fryer: wrapSvg(`
    ${MDI_FAN}
    <path d="M5.5 6.5v3.2m0 0l-1-1m1 1l1-1M18.5 6.5v3.2m0 0l-1-1m1 1l1-1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
  `),

  air_sousvide: wrapSvg(`
    <path d="M7.5 15.2v-4.4a1.5 1.5 0 0 1 1.5-1.5h6a1.5 1.5 0 0 1 1.5 1.5v4.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none" />
    <line x1="6" y1="16.5" x2="18" y2="16.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" />
  `),

  plate_warm: wrapSvg(`
    <ellipse cx="12" cy="16" rx="5" ry="1.3" stroke="currentColor" stroke-width="1.3" fill="none" />
    <ellipse cx="12" cy="13.2" rx="4.4" ry="1.2" stroke="currentColor" stroke-width="1.3" fill="none" />
    <ellipse cx="12" cy="10.4" rx="3.8" ry="1.1" stroke="currentColor" stroke-width="1.3" fill="none" />
  `),

  keep_warm: wrapSvg(`
    <path d="M7 16h10M7.5 16a4.5 4.5 0 0 1 9 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none" />
    <circle cx="12" cy="11" r="0.9" fill="currentColor" />
    <path d="M9.8 7.8c0-.7.6-.9 1-1.3M14.2 7.8c0-.7-.6-.9-1-1.3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
  `),

  defrost: wrapSvg(`
    <path d="M12 7.5v8.5M8.5 11.8h7M9.6 9.4l4.8 4.8M9.6 14.2l4.8-4.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
    <path d="M12 17.2c-.7 0-1.2.5-1.2 1.1 0 .6.5 1.1 1.2 1.1s1.2-.5 1.2-1.1c0-.6-.5-1.1-1.2-1.1z" fill="currentColor" />
  `),

  deodorization: wrapSvg(`
    <path d="M6 10c2-1 4-1 6 0s4 1 6 0M6 14c2-1 4-1 6 0s4 1 6 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none" />
    <circle cx="8" cy="7.5" r="0.8" fill="currentColor" />
    <circle cx="16" cy="16.5" r="0.8" fill="currentColor" />
  `),

  steam_clean: wrapSvg(`
    ${BOTTOM_BAR}
    <path d="M8.5 15.2c-.5-1.3.4-2.2 0-3.5M12 15.2c-.5-1.3.4-2.2 0-3.5M15.5 15.2c-.5-1.3.4-2.2 0-3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" fill="none" />
  `),

  clean_air_pyro: wrapSvg(`
    <path d="M12 16.8c-1.8 0-3.1-1-3.1-2.6 0-1.7 1.8-3 1.8-4.8.9.9 2.7 2.2 2.7 3.9 0 1.9-1.4 3.5-1.4 3.5z" fill="currentColor" />
    <path d="M15.5 7.5l.4.9.9.4-.9.4-.4.9-.4-.9-.9-.4.9-.4z" fill="currentColor" />
  `),

  // --- Dual-Zone Upper Modes (75% Height, Capped with Dashed Base) ---

  upper_convection: wrapSvg(MDI_FAN_UPPER, FRAME_UPPER_ZONE),

  upper_top_convection: wrapSvg(`${TOP_BAR}${MDI_FAN_UPPER}`, FRAME_UPPER_ZONE),

  upper_large_grill: wrapSvg(FULL_GRILL, FRAME_UPPER_ZONE),

  upper_autocook: wrapSvg(
    `
    <path d="M7 13.5h10M7 10.5h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <path d="M15.5 6.5l1.4-1.4M16.8 9.3l1.6.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
    <circle cx="15.8" cy="7.9" r="1.1" fill="currentColor" />
  `,
    FRAME_UPPER_ZONE,
  ),

  // --- Dual-Zone Lower Modes (75% Height, Capped with Dashed Ceiling) ---

  lower_convection: wrapSvg(MDI_FAN_LOWER, FRAME_LOWER_ZONE),

  lower_bottom_convection: wrapSvg(`${BOTTOM_BAR}${MDI_FAN_LOWER}`, FRAME_LOWER_ZONE),

  lower_bottom: wrapSvg(BOTTOM_BAR, FRAME_LOWER_ZONE),

  lower_autocook: wrapSvg(
    `
    <path d="M7 16h10M7 13h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <path d="M15.5 9l1.4-1.4M16.8 11.8l1.6.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
    <circle cx="15.8" cy="10.4" r="1.1" fill="currentColor" />
  `,
    FRAME_LOWER_ZONE,
  ),
};

/**
 * Normalises an incoming HA state string and returns the 70x70 SVG string directly.
 * @param {string} rawMode - e.g. "Upper Top Convection", "lower_bottom", "Keep Warm"
 * @returns {string} SVG string
 */
export function getOvenIconSvg(rawMode) {
  if (!rawMode) return OVEN_ICONS.no_operation;

  const key = String(rawMode)
    .trim()
    .toLowerCase()
    .replace(/\+/g, "_plus_")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace("pluse", "plus");

  return OVEN_ICONS[key] || OVEN_ICONS.no_operation;
}
