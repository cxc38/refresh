import { loadBlocks } from '../aem.js';
import { decorateMain } from '../scripts.js';

const cache = {};

async function load(path) {
  if (path && path.startsWith('/')) {
    if (cache[path]) {
      return cache[path];
    }

    const url = path.startsWith('/content/') && path.endsWith('.html')
      ? path.replace('.html', '.plain.html')
      : `${window.hlx.fragmentBasePath}${path}.plain.html`;
    const resp = await fetch(url);
    if (resp.ok) {
      const main = document.createElement('main');
      main.dataset.fragment = 'true';
      main.innerHTML = await resp.text();
      // reset base path for media to fragment base
      const resetAttributeBase = (tag, attr) => {
        const media = Array.from(main.querySelectorAll(`${tag}[${attr}^="./media_"]`));
        for (let i = 0; i < media.length; i += 1) {
          const elem = media[i];
          elem[attr] = new URL(elem.getAttribute(attr), `${window.hlx.codeBasePath}${path}`).href;
        }
      };
      resetAttributeBase('img', 'src');
      resetAttributeBase('source', 'srcset');

      return main;
    }
  }

  return null;
}

export default async function loadFragment(path) {
  const main = await load(path);
  if (main) {
    decorateMain(main);
    await loadBlocks(main);
    return main;
  }
  return null;
}
