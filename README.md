# User ID to Name Replacer for GitHub Enterprise

Replaces the D/I/C user names in GitHub Enterprise with the users' real names.

Based on:
- https://github.com/cgrail/github-chrome-fullname
- https://github.com/Elethom/github-fullname.safariextension

## Usage

Add this as user script to

- Greasemonkey
- Userscripts (Safari 13+)
- Tampermonkey
- Violentmonkey

or other userscript browser extensions.

For Safari, Userscript is recommended as it does as much as Tampermonkey but is available for free from the App store.

### Update of Dynamic Data

GitHub loads and renders some data dynamically, e.g. the contributors list on the insights page.

Until a better way can be found, **double-clicking** on the page will run the replacer again, covering the names of contributors on such dynamically loaded pages.

