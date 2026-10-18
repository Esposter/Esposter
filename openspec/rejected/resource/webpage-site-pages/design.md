# Webpage Site Pages

A Webflow project is a site of pages, each with its own url under the site, and GrapesJS has a pages API that would let one Webpage resource hold several.

## Why not

A page is a second webpage with a shared name. The explorer holds as many webpages as an owner wants, each published at its own url, and a link block links one to another as it would any page on the web; grouping pages inside one resource would nest a tree within the explorer's tree, which is also why [note workspace nesting](../note-workspace-nesting/design.md) and [dashboard pages](../dashboard-pages/design.md) were turned down. A site's shared navigation and its own domain are what make pages worth grouping, and neither exists for a single-owner page hosted under the app.
