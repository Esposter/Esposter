---
title: Webpage social preview
description: Proposal — a Settings blade on the Webpage type holding the description and share image its published page is unfurled with, as Webflow's page settings do, instead of the site's own logo and blurb.
model: claude-opus-5-5
---

# Webpage Social Preview

A published webpage is a page someone shares, and a shared link is judged by its unfurl: the title, the line under it and the image above both. Today `useReadPublishedResourceContent` sets the title from the resource's name and nothing else, so every published webpage unfurls with the site's own description and the Esposter logo from `NuxtSEO`, whatever the page is about.

Webflow puts both in each page's settings: a meta description, "the text that typically appears below the page's title in search results", and an Open Graph image that "displays above the title and description", with the Open Graph title and description able to follow the SEO pair.

## What it adds

- **A Settings blade** on the Webpage type — `ResourceBladeDefinitionMap[Webpage]` gains it after the Editor, as the Sheet's Settings blade sits after its Data — holding two fields:
  - **Description** — plain text, capped by a named limit, used as the page's meta description and its Open Graph description.
  - **Share image** — an image uploaded through `useUploadResourceFile` as one of the webpage's own file assets ([resource file assets](/docs/resource/resource-file-assets)), shown as a preview with Replace and Remove, used as the Open Graph image.
- **Both live on the content**, as `description` and `imageUrl` on `WebpageEditor` beside the captured `css` and `html`, so they ride every save and every snapshot and are restored with the rest of the page. The store's save carries them across a GrapesJS storage tick the way it carries the item metadata.
- **The published view reads them**: `View.vue` sets `description`, `ogDescription` and `ogImage` from the snapshot, over the site defaults. The image url is a published clone, since the publish transform (`transformPublishedBlobUrls`) clones every asset url the content holds and rewrites it, which reaches the new field without a change.
- **The title stays the resource's name**, which rename already edits; a second title field would be a second name.

## What is deliberately not in it

- **No per-type rollout.** Every publishable type unfurls the same way, but a Webpage is the one whose purpose is to be shared as a page; a Note or a Flowchart takes this when an owner asks, by the same two fields on its own content.
- **No generated description.** Webflow offers AI generation; the first LLM dependency is [deferred](/docs/resource/deferred/ai-resource-generation).

## Key files

| File                                                                   | Role after the change                                           |
| ---------------------------------------------------------------------- | --------------------------------------------------------------- |
| `apps/web/shared/models/webpageEditor/data/WebpageEditor.ts`           | `description` and `imageUrl` on the content and its schema      |
| `apps/web/app/store/webpageEditor/index.ts`                            | carries both across an editor save; the Settings blade's writes |
| `apps/web/app/services/resource/ResourceBladeDefinitionMap.ts`         | the Webpage's Settings blade                                    |
| `apps/web/app/components/Resource/Webpage/View.vue`                    | the published page's description and image meta                 |
| `apps/web/app/composables/resource/useReadPublishedResourceContent.ts` | unchanged: the title it sets is kept                            |

## Sources

- [Webflow Help Center — Add SEO title and meta description](https://help.webflow.com/hc/en-us/articles/33961237278611-Add-SEO-title-and-meta-description) — the meta description as a page setting.
- [Webflow Help Center — Control the look of social shares with Open Graph](https://help.webflow.com/hc/en-us/articles/33961370297107-Control-the-look-of-social-shares-with-Open-Graph) — the Open Graph image above the title and description, and the Open Graph pair following the SEO pair.
