// ==UserScript==
// @name        SAP GitHub User Name Display
// @description Replaces D/I/C user names with the real names
// @author      Alexander Lais (i551749)
// @inject-into content
// @match       *://github.tools.sap/*
// @version     0.1-2021-11-14
// ==/UserScript==

// Based on:
// - https://github.com/cgrail/github-chrome-fullname
// - https://github.com/Elethom/github-fullname.safariextension

const nodes = {};
const modifiedNodes = [];
const names = {};

const setName = n => {
  // Return if already modified
  if (modifiedNodes.includes(n)) { return; }
  // Get username
  let un = n.innerText.trim();
  const at = un.startsWith('@');
  if (at) { un = un.substring(1); }
  // Set username
  if (at) {
    // `@${name} (${un})`;
    n.innerText = `@${names[un]}`;
  } else {
    // `${name} (@${un})`;
    n.innerText = names[un];
  }
  n.style.fontWeight = 600;
  modifiedNodes.push(n);
};

const replace = n => {
  // Get username
  let un = n.innerText.trim();
  if (un.length === 0) { return; }
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
      var searchRegex = new RegExp(`<title>${un} \\((.*)\\)<\\/title>`, "g")
      var match = searchRegex.exec(r.responseText)
      if (match) {
          // remove UserID from name, if it contains it.
          var fixedName = match[1].replace(id,"").trim() + ` (${un})`;
          names[un] = fixedName;
          nodes[un].forEach(setName);
      }
  };
  r.open('GET', `https://${window.location.hostname}/${un}`, true);
  r.send(null);
};

const displayFullname = () => {
  [
    'a.commit-author',                  // commits - author
    'div.commit-tease a[rel="author"]', // files   - author
    'span.opened-by>a',                 // issues  - author
    'a.author',                         // issue   - author
    'a.assignee>span',                  // issue   - assignee & reviewer
    'a.user-mention',                   // issue   - user mention
    'span.discussion-item-entity',      // issue   - assignee in timeline
    '.review-status-item.ml-6 strong',  // pr      - review status
  ].forEach( s => document.querySelectorAll(s).forEach(replace) );
};

// First time
displayFullname();
// Listen for pjax load
window.addEventListener('pjax:complete', displayFullname);