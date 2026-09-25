---
title: Social preview image
description: Proposal — the image a shared link previews with is drawn in the default style's tokens rather than being the logo on white.
model: claude-opus-5-5
---

# Social Preview Image

The address bar and an installed app already take the palette: the theme colour meta tag follows the selected style and mode, and the manifest takes the default style's light palette. A shared link does not. Its preview is the logo image on its own, at a fixed size, because `nuxt-og-image` runs with `zeroRuntime` and nothing declares an image through `defineOgImage`, so X also gets its card only because the SEO component sets `twitter:card` by hand.

## Scope

- **One template, drawn in the tokens.** An OG image component renders the site name and the page's title over the default style's panel, in its heading face and colour, with the accent as its one highlight. It reads the palette from `UiPaletteMap` rather than restating a colour.
- **Prerendered, never at runtime.** `zeroRuntime` stays: the images are generated at build for the routes that prerender, and a route that does not keeps the logo.
- **Declared through `defineOgImage`**, so the module emits the card tags itself and the SEO component's hand-set `twitter:card` goes.

## Key files

| File                                   | Role after the change                                      |
| :------------------------------------- | :--------------------------------------------------------- |
| `apps/web/configuration/ogImage.ts`    | The module's options, `zeroRuntime` kept                   |
| `apps/web/app/components/Nuxt/SEO.vue` | Declares the page's image instead of the logo and the card |

## Sources

- [Nuxt OG Image](https://nuxtseo.com/docs/og-image/getting-started/introduction), Nuxt SEO: templates, `defineOgImage` and zero-runtime prerendering.
