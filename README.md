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

The script uses localStorage to make a longer-term cache of user IDs to name mappings, resulting in fewer hits on the github enterprise server. You can bust the cache by deleting the entry named `sap.tools.github.idToName` using the Safari developer tools.
### Update of Dynamic Data

GitHub loads and renders some data dynamically, e.g. the contributors list on the insights page.

The script re-runs the replacement when the DOM was modified. Nodes that were already modified in a previous run are left intact.
