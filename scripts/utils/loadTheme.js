import {getMetadata} from "../aem.js";

/**
 * Loads theme from the spreadsheet.
 */
export default async function loadTheme(path, key, valueColumn) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${window.hlx.codeBasePath}${path}`);
    if (resp.ok) {
      const { data } = await resp.json();
      if (!keyColumn) {
        return data;
      }
      return Object.fromEntries(
        data
          .filter((row) => row[keyColumn])
          .map((row) => [row[keyColumn].trim(), valueColumn ? row[valueColumn] : row]),
      );
    }
  }
  return null;
}

export default async function loadThemeFromSpreadsheet(path) {
  const themeName = getMetadata('theme');
  if (themeName) {
    const jsonObject = await loadSpreadsheet(path);

  }
}
