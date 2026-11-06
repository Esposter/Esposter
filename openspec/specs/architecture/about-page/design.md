# About page

The About page is for anyone browsing the site, so it says what Esposter is and what there is to do here in plain words, and stops there. It is a hero, the places to go, one sentence on why, the supporters and the globe, with the Vue credit under the name.

## Decisions

- **It speaks to a visitor, not a developer.** No stack, no packages, no process: those live in the repository's README and the specs, where a reader who wants them already is. Rejected: a "how it's built" section, which turned the page into documentation for the one reader in a hundred who came for it.
- **The places are the launcher's own, in its groups.** The cards are drawn from `ProductGroups`, the list the launcher shows, under its Talk, Make and Play headings, with one plain line each, so a product added there appears here with its line and the two never describe different sites. The groups stand side by side as columns and wrap as the screen narrows, so a wide screen is used across. Rejected: a list of its own on the page, which would drift from the launcher the first time a product moved.
- **The hero is the site's own sentence.** The name, the site description and how the name is said, read from the same constants as the site's metadata. Rejected: the Vue-logo line as the headline, which put a framework's name above the site's own.
- **The gem stands beside the why.** It is sized by its caller and sits in the same row as the sentence, so it costs no row of its own; under the name or beside the logo it added a row or crowded the logo. Rejected: the gem under the name, and the gem beside the logo, which made the two marks read as one.
- **One sentence on why.** A minimal, lean place to do and create whatever you want, and who made it; the supporters and the globe follow it unchanged. Rejected: a second sentence, which only said the first again.
- **The Vue credit sits under the name.** The "powered by" line and its logo follow the hero, since they say what the site stands on. Rejected: the foot of the page, where a credit nobody scrolls to credits nothing.
- **The globe loads late.** Its code is fetched when the reader nears it (`about-globe`).

## Key files

| Path                                           | Role                                                                |
| :--------------------------------------------- | :------------------------------------------------------------------ |
| `apps/web/app/pages/about.vue`                 | the page: the sections in order and the globe's gate                |
| `apps/web/app/components/About/Header.vue`     | the hero: the logo, the name, the description and its pronunciation |
| `apps/web/app/components/About/Products.vue`   | the launcher's groups as side-by-side columns of cards              |
| `apps/web/app/components/About/Content.vue`    | the one line on why and who made it, with the gem beside it         |
| `apps/web/app/components/About/Supporters.vue` | the supporters, as a marquee or a carousel                          |
| `apps/web/app/components/About/PoweredBy.vue`  | the Vue credit and its logo under the name                          |
| `apps/web/app/services/app/ProductGroups.ts`   | the places, shared with the launcher, each with its plain line      |
