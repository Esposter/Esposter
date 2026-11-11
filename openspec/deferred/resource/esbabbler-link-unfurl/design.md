# Esbabbler link unfurl

Rich embeds (title, type icon, preview) when a published resource URL is posted in an esbabbler message.

## Why deferred

A posted `/view/[type]/[id]` address already unfurls: the message's link preview reads the page's own title, description and image. What is left is a resource-type icon on that card, which is cosmetic and would need the preview to know the address names a resource.

## Revisit when

A reader of a room cannot tell what kind of resource a shared link is from its preview alone.

## Cheaper interim

Plain URL + the page's own OG meta tags (browsers/other platforms unfurl those for free).
