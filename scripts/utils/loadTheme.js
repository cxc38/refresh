import { getMetadata, loadCSS } from '../aem.js';

/**
 * Loads theme from the spreadsheet.
 */
async function loadSpreadsheet(path, themeName, valueColumn) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(path);
    if (resp.ok) {
      const { data } = await resp.json();
      if (!themeName) {
        return data;
      }
      data.forEach((item) => {
        if (item.theme.toLowerCase() === themeName.toLowerCase()) {
          return item[valueColumn];
        }
        return null;
      });
    }
  }
  return null;
}

export async function loadThemeFromSpreadsheet(path) {
  const themeName = getMetadata('theme');
  if (themeName) {
    const cssPath = await loadSpreadsheet(path, themeName, 'css');
    loadCSS(cssPath);
  }
}

export default async function loadTheme() {
  await loadThemeFromSpreadsheet('/themes-config.json');
}
