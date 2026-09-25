---
title: Social preview image
description: A shared link previewing with an image drawn in the default style's tokens, generated at build for pages that prerender.
---

# Social Preview Image

Replacing the logo a shared link previews with by one `nuxt-og-image` template drawn in the default style's tokens: the site name and the page's title over the default panel, declared through `defineOgImage`. `zeroRuntime` renders these images only at prerender, so the proposal had to prerender the public pages a shared link reaches, the docs above all.

**Why not:** No page can prerender without giving up what the app shell does for every reader, and the docs pay the same cost as any other page. The shell renders the reader in the first response. The design style, theme mode and readable text are cookie refs in Pinia setup stores, and the session is `useSession` through `useFetch`. A prerendered page bakes the defaults into its payload. On hydration Pinia writes the payload's values into those refs and `useCookie` writes them back, so one visit resets the reader's choices, and a signed-in reader sees the signed-out dock. Making the shell prerender-safe means reading all of that on the client after mount, so every reader first sees the default style and then theirs. The docs gain nothing that pays for this. They already render on request from the bundled content database with no database or network read, so prerendering saves little time, and the preview image would reach only the few links anyone shares. The two routes around prerendering fail too. Listing the image URLs for prerender on their own does not work, because a page rendered on request under `zeroRuntime` emits a dynamic `/_og/d/` address rather than the static one. Dropping `zeroRuntime` puts an image renderer on the request path. A shared link keeps the logo and the hand-set `twitter:card`.
