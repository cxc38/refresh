import { getMetadata } from '../aem.js';

/**
 * Loads theme from the spreadsheet.
 */
async function loadSpreadsheet(path, themeName, valueColumn) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${window.hlx.codeBasePath}${path}`);
    if (resp.ok) {
      const jsonArray = await resp.json().data;
      if (!themeName) {
        return jsonArray;
      }
      jsonArray.forEach((item) => {
        if (item.theme.toLowerCase() === themeName.toLowerCase()) {
          return item[valueColumn];
        }
        return null;
      });
    }
  }
  return null;
}

export default async function loadTheme(path) {
  const themeName = getMetadata('theme');
  if (themeName) {
    await loadSpreadsheet(path, themeName, 'css');
  }
}

await loadTheme('/themes-config.json');
