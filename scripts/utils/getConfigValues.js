import loadConfig from './loadConfig.js';

let configPromise = null;

async function loadCachedConfig() {
  const configJson = sessionStorage.getItem('config');
  if (configJson) {
    return JSON.parse(configJson);
  }
  const config = await loadConfig('/config.json', 'key', 'value');
  sessionStorage.setItem('config', JSON.stringify(config));
  return config;
}

export default function getConfigValues() {
  if (!configPromise) {
    configPromise = loadCachedConfig();
  }
  return configPromise;
}
