import en from "./languages/en.json";

const languages = {
  en,
};

/**
 * Resolves a dot-notated key (e.g. 'controls.start') into the localized string
 * matching the user's active language, falling back to English.
 *
 * Supports optional replacement pairs: search string/regex and replacement, or a map of replacements.
 *
 * @param {string} key - e.g. "controls.target_temperature"
 * @param {string} [lang] - Language code (e.g. "en", "de", "fr")
 * @param {string|RegExp|Object} [search] - String/regex to replace, or object of search/replace pairs
 * @param {string} [replace] - Replacement string if search is a string/regex
 * @returns {string} Localized text
 */
export function localize(key, lang, search = "", replace = "") {
  let selectedLang = lang;

  if (!selectedLang) {
    try {
      selectedLang = JSON.parse(localStorage.getItem("selectedLanguage") || '""') || "en";
    } catch {
      selectedLang = "en";
    }
  }

  // Normalize (e.g. "en-US" -> "en")
  const langKey = selectedLang.split("-")[0].toLowerCase();

  const keys = key.split(".");
  let translated;

  // 1. Try specified language
  try {
    translated = keys.reduce((obj, k) => obj?.[k], languages[langKey] || languages[selectedLang]);
  } catch {
    translated = undefined;
  }

  // 2. Fall back to English
  if (translated === undefined) {
    try {
      translated = keys.reduce((obj, k) => obj?.[k], languages.en);
    } catch {
      translated = key;
    }
  }

  if (translated === undefined) {
    return key;
  }

  if (typeof search === "object" && !(search instanceof RegExp)) {
    for (const [sKey, sVal] of Object.entries(search)) {
      translated = translated.replace(new RegExp(`{${sKey}}`, "g"), sVal);
    }
  } else if (search !== "" && replace !== "") {
    translated = translated.replace(search, replace);
  }

  return translated;
}

/**
 * Helper to localize cooking mode strings using the mode keys or raw labels.
 */
export function localizeMode(mode, lang) {
  if (!mode) return "";
  const normalizedKey = String(mode)
    .trim()
    .toLowerCase()
    .replace(/[\s+-]+/g, "_")
    .replace(/pluse/g, "plus");

  const localized = localize(`modes.${normalizedKey}`, lang);
  if (localized !== `modes.${normalizedKey}`) {
    return localized;
  }

  return mode;
}
