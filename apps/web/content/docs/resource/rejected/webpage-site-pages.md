---
title: Webpage site pages
description: Rejected — several pages inside one Webpage resource with shared navigation, as a Webflow site holds, through GrapesJS's pages API.
---

# Webpage Site Pages

A Webflow project is a site of pages, each with its own url under the site, and GrapesJS has a pages API that would let one Webpage resource hold several.

## Why not

A page is a second webpage with a shared name. The explorer holds as many webpages as an owner wants, each published at its own url, and a link block links one to another as it would any page on the web; pages inside one resource would be a second hierarchy beside the explorer's — the reason [note workspace nesting](/docs/resource/rejected/note-workspace-nesting) and [dashboard pages](/docs/resource/rejected/dashboard-pages) were rejected too. A site's shared navigation and its own domain are what make pages worth grouping, and neither exists for a single-owner page hosted under the app.
