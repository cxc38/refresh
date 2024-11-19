import getConfigValues from './getConfigValues.js';

export default async function getConfigValue(key, defaultValue = null) {
  const config = await getConfigValues();
  if (config && key in config) return config[key];
  return defaultValue;
}
