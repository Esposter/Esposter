---
title: Social preview image
description: Proposal — the image a shared link previews with is drawn in the default style's tokens rather than being the logo on white.
model: claude-opus-5-5
---

# Social Preview Image

The address bar and an installed app already take the palette: the theme colour meta tag follows the selected style and mode, and the manifest takes the default style's light palette. A shared link does not. Its preview is the logo image on its own, at a fixed size, because `nuxt-og-image` runs with `zeroRuntime` and nothing declares an image through `defineOgImage`, so X gets its card only because the SEO component sets `twitter:card` by hand.

## Scope

- **One template, drawn in the tokens.** An OG image component renders the site name and the page's title over the default style's panel, in its heading face and colour, with the accent as its one highlight. It reads the palette from `UiPaletteMap` rather than restating a colour.
- **Prerendered, never at runtime.** `zeroRuntime` stays: the images are generated at build for the routes that prerender, and a route that does not keeps the logo.
- **Declared through `defineOgImage`** on the prerendered pages. The hand-set `twitter:card` stays, because `zeroRuntime` strips the one the module would emit.

## What it waits on

No route prerenders today: `configuration/routeRules.ts` only turns SSR off for some pages, and Nitro has no prerender list. Under `zeroRuntime`, the image route answers only in dev and at prerender, and throws in production. So a `defineOgImage` call on a page rendered on request emits an `og:image` address that fails, which is worse than the logo it replaces. This proposal therefore ships together with prerendering the public pages that a shared link actually reaches, the docs above all, and it declares the image only on those pages. Every other page keeps the logo and the hand-set `twitter:card`. The alternative, dropping `zeroRuntime` so the server renders images on request, puts an image renderer on the request path and is not taken.

No public page can prerender as the app shell stands, because the shell renders the reader in the first response. The design style, theme mode and readable text are cookie refs in setup stores, and the session is `useSession` through `useFetch`. A prerendered page bakes the defaults into its payload. On hydration Pinia writes the payload's values into those refs, and `useCookie` writes them back, so a visit resets the reader's choices to the defaults and a signed-in reader sees the signed-out shell. Prerendering therefore needs the shell to stop taking the reader from the payload first: the cookie stores read on the client and are left out of hydration, and the session is fetched after mount. That costs the first paint in the reader's own style, which the stores exist to give. An image URL cannot be listed for prerender on its own either, since a page rendered on request under `zeroRuntime` emits a dynamic `/_og/d/` address rather than the static one.

## Key files

| File                                   | Role after the change                                      |
| :------------------------------------- | :--------------------------------------------------------- |
| `apps/web/configuration/ogImage.ts`    | The module's options, `zeroRuntime` kept                   |
| `apps/web/app/components/Nuxt/SEO.vue` | Declares the page's image instead of the logo and the card |

## Sources

- [Nuxt OG Image](https://nuxtseo.com/docs/og-image/getting-started/introduction), Nuxt SEO: templates, `defineOgImage` and zero-runtime prerendering.
