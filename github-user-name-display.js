// ==UserScript==
// @name        SAP GitHub User Name Display
// @description Replaces D/I/C user names with the real names
// @inject-into content
// @match       *://github.tools.sap/*
// @match       *://github.wdf.sap.corp/*
// @match       *://github.com/*
// @downloadURL https://raw.githubusercontent.com/peanball/github-id-username-userscript/master/github-user-name-display.js
// @updateURL   https://raw.githubusercontent.com/peanball/github-id-username-userscript/master/github-user-name-display.js
// @version     0.10.0-2022-11-25
// @exclude     *://*/pages/*
// ==/UserScript==

// @author      Alexander Lais (i551749)

// Based on:
// - https://github.com/cgrail/github-chrome-fullname
// - https://github.com/Elethom/github-fullname.safariextension
// - https://stackoverflow.com/a/14570614

// Feel free to customize the format!
const format = "{name} ({id})";

const localStorageKey = "sap.tools.github.idToName";

const readLS = (item) => {
  const stored = window.localStorage.getItem(localStorageKey)
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.log("Could not load ID cache from local storage, initializing empty.", e);
    }
  }
  return {};
}

const writeLS = (content) => {
  if (content) {
    window.localStorage.setItem(localStorageKey, JSON.stringify(content));
  } else {
    window.localStorage.removeItem(localStorageKey);
  }
}

const nodes = {};
const modifiedNodes = [];
const names = readLS() || {};

const userIdRegex = /\b(@?(?:[di]\d{6}|c\d{7}))\b/gi

const setName = n => {
  // Return if already modified
  if (modifiedNodes.includes(n)) { return; }

  // Get username
  let match
  if (n.className.indexOf("tooltipped") > -1) {
      match = n.getAttribute("aria-label").match(userIdRegex)
  } else {
      match = n.innerText.match(userIdRegex)
  }
    
  let un = match[0];
  if (n.hasAttribute('aria-label')) {
      n.setAttribute('aria-label', n.getAttribute('aria-label').replace(userIdRegex, names[un]))
  } else {
      // Set username
      n.innerText = n.innerText.replace(userIdRegex, names[un]);
  }
  
  modifiedNodes.push(n);
};

const replace = n => {
  // Get username
    
  let match
  if (n.className.indexOf("tooltipped") > -1) {
      match = n.getAttribute("aria-label").match(userIdRegex)
  } else {
      match = n.innerText.match(userIdRegex)
  }
  
  if (!match) { return; }
  const un = match[0]
  
  const at = un.startsWith('@');
  if (at) { un = un.substring(1); }
  if (names[un]) {
    setName(n);
    return;
  }
  // Return if queried
  if (nodes[un]) {
    nodes[un].push(n);
    return;
  } else {
    nodes[un] = [n];
  }
  // Query name
  const r = new XMLHttpRequest();
  r.onreadystatechange = () => {
    const searchRegex = new RegExp(`<title>${un} \\((.*)\\)<\\/title>`, "g")
    const match = searchRegex.exec(r.responseText)
    if (match) {
      // remove UserID from name, if it contains it.
      const name = match[1].replace(un, "").trim();
      const fixedName = format.replace("{name}", name).replace("{id}", un);
      names[un] = fixedName;
      nodes[un].forEach(setName);
      writeLS(names);
    }
  };
  r.open('GET', `https://${window.location.hostname}/${un}`, true);
  r.send(null);
};

const displayFullName = () => {
  [
    'a.commit-author',                  // commits - author
    'div.commit-tease a[rel="author"]', // files   - author
    'span.opened-by>a',                 // issues  - author
    'a.author',                         // issue   - author
    'a.assignee>span',                  // issue   - assignee & reviewer
    'a.user-mention',                   // issue   - user mention
    'span.discussion-item-entity',      // issue   - assignee in timeline
    '.review-status-item.ml-6 strong',  // pr      - review status
    'a[data-hovercard-type="user"]',    // insights - contributors (only with doubleclick)
    '.flash a',
    '.project-card a',
    'button.tooltipped',
  ].forEach(s => document.querySelectorAll(s).forEach(replace));
};

const observeDOM = (function () {
  const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

  return function (obj, callback) {
    if (!obj || obj.nodeType !== 1) return;

    if (MutationObserver) {
      // define a new observer
      const mutationObserver = new MutationObserver(callback)

      // have the observer observe foo for changes in children
      mutationObserver.observe(obj, { childList: true, subtree: true })
      return mutationObserver
    }

    // browser support fallback
    else if (window.addEventListener) {
      obj.addEventListener('DOMNodeInserted', callback, false)
      obj.addEventListener('DOMNodeRemoved', callback, false)
      obj.addEventListener('DOMSubtreeModified', callback, false)

    }
  }
})();

// First time
displayFullName();
// refresh on DOM changes
observeDOM(document.body, displayFullName);
