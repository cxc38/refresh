/*
 * Fragment Block
 * Include content on a page as a fragment.
 * https://www.aem.live/developer/block-collection/fragment
 */

import {
  decorateMain,
} from '../../scripts/scripts.js';

import {
  loadSections,
} from '../../scripts/aem.js';

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {HTMLElement} The root element of the fragment
 */
export async function loadContentFragment(path) {
  function genHtmlFromJson(jsonObject) {
    const { title } = jsonObject.data.teaserModelByPath.item;
    const descText = jsonObject.data.teaserModelByPath.item.description.plaintext;
    // eslint-disable-next-line no-underscore-dangle
    const imagePath = jsonObject.data.teaserModelByPath.item.teaserImage._publishUrl;
    return `<h2>${title}</h2><p>${descText}</p><img src="${imagePath}" alt="Teaser Image">`;
  }

  if (path) {
    const resp = await fetch(`${path}`);
    if (resp.ok) {
      const jsonObject = await resp.json();
      const main = document.createElement('main');
      main.innerHTML = genHtmlFromJson(jsonObject);
      decorateMain(main);
      await loadSections(main);
      return main;
    }
  }
  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadContentFragment(`https://publish-p134211-e1317444.adobeaemcloud.com/graphql/execute.json/refresh/getTeaserByPath;apath=/content/dam${path}`);
  if (fragment) {
    block.replaceChildren(...fragment.childNodes);
  }
}
