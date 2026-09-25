---
title: Finishing details
description: Proposal — the details a designed interface owes beyond its components, which the design language does not draw yet — print, forced colours, the browser chrome and install colours, charts and highlighted code in the tokens, touch targets, and pixel art kept crisp.
model: claude-opus-5-5
---

# Finishing Details

The [design language](/docs/architecture/design-language) draws every surface, every state and the document's own chrome — scrollbars, selection, caret, focus — from the tokens. A handful of places still fall back to a default the tokens never reach, and each is where a themed app gives itself away as not quite designed. This proposal is the list, each item small enough to land on its own.

## What works today

- The document chrome, the surfaces, the type and the motion read the tokens in every style and mode.
- The focus ring stays an outline where a field's tint stands in for it, so forced colours still leave a keyboard reader a mark.
- The agent console's world canvas already renders with pixelated scaling.

## What this adds

- **Forced colours.** An edge drawn as a box shadow disappears when Windows forces colours. Every surface also carries a transparent border the width of the style's border token, which the forced palette paints in, so a frame, a button and a field keep their outline. The border takes no room, since the style's edges are already shadows outside or inset.
- **Print.** A print stylesheet drops the dock, scrims, shadows and every surface's fill, prints text dark on white in the body face, and prints a link's address after it, so a docs page or a post prints as a document.
- **The browser around the page.** The theme colour meta tag follows the selected theme's background, the PWA manifest's colours are the default style's, and the social preview image is drawn in the tokens, so the address bar, an install and a shared link match the page. Today the manifest hard-codes white.
- **Charts.** The chart component's axes, grid lines and tooltip read the muted, divider and lifted tokens rather than a mode it is pinned to, and its series colours are drawn from the accent and the status tokens, each series paired with a marker shape so a series never reads by colour alone.
- **Highlighted code.** The docs highlight code in a stock dark theme in every mode. A highlighting theme built from the tokens — keywords in the accent, strings in success, comments in muted — follows the style and mode as the prose around it does.
- **Touch targets.** On a coarse pointer every control is at least eleven steps square, through a variant on `ui-button` and `ui-item` rather than per call site.
- **Pixel art stays crisp.** The achievement badges, the game sprites and every image drawn on a pixel grid render with pixelated scaling; a photo or an avatar never does.

## Key files

| File                                           | Role after the change                                           |
| :--------------------------------------------- | :-------------------------------------------------------------- |
| `apps/web/uno.config.ts`                       | The surfaces' transparent border and the coarse-pointer variant |
| `apps/web/app/assets/css/globals.scss`         | The print stylesheet                                            |
| `apps/web/configuration/pwa.ts`                | Its manifest colours read the default style's palette           |
| `apps/web/configuration/content.ts`            | Its highlighting theme is built from the tokens                 |
| `apps/web/app/components/Styled/ApexChart.vue` | Its chrome and series read the tokens                           |

## Sources

- [Forced colours](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors), MDN: which properties the forced palette overrides, and why a transparent border survives where a shadow does not.
- [Image rendering](https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering), MDN: pixelated scaling for pixel art.
- [Target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), WCAG 2.2: the minimum a coarse pointer's target is held above.
