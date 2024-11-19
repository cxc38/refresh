export default async function loadConfig(path, keyColumn, valueColumn) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${window.hlx.fragmentBasePath}${path}`);
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
