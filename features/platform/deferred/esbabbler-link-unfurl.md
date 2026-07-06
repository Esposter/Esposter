# Esbabbler Link Unfurl

Rich embeds (title, type icon, preview) when a published document URL is posted in an esbabbler message.

## Why deferred

Plain URLs to `/view/[type]/[id]` pages already work the moment publishing ships; unfurling is polish that touches the message pipeline (metadata fetch, embed rendering, cache) for cosmetic gain.

## Revisit when

Publishing is shipped and shared links are actually circulating in rooms.

## Cheaper interim

Plain URL + the page's own OG meta tags (browsers/other platforms unfurl those for free).
