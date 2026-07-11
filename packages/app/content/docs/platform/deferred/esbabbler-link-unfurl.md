---
title: Esbabbler link unfurl
description: Deferred — rich embeds when a published resource URL is posted in an esbabbler message.
---

# Esbabbler link unfurl

Rich embeds (title, type icon, preview) when a published resource URL is posted in an esbabbler message.

## Why deferred

Plain URLs to `/view/[type]/[id]` pages already work; unfurling is polish that touches the message pipeline (metadata fetch, embed rendering, cache) for cosmetic gain.

## Revisit when

Shared published links are actually circulating in rooms.

## Cheaper interim

Plain URL + the page's own OG meta tags (browsers/other platforms unfurl those for free).
