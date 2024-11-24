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
      for (let i = 0; i < data.length; i += 1) {
        if (data[i].theme.toLowerCase() === themeName.toLowerCase()) {
          loadCSS(data[i].css);
          break;
        }
      }
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
