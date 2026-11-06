# About page

The About page is for anyone browsing the site, so it says what Esposter is and what there is to do here in plain words, and stops there. It is a hero, the places to go, one line on why, the supporters and the globe.

## Decisions

- **It speaks to a visitor, not a developer.** No stack, no packages, no process: those live in the repository's README and the specs, where a reader who wants them already is. Rejected: a "how it's built" section, which turned the page into documentation for the one reader in a hundred who came for it.
- **The places are the launcher's own.** The cards are drawn from `ProductGroups`, the list the launcher shows, with one plain line each, so a product added there appears here with its line and the two never describe different sites. Rejected: a list of its own on the page, which would drift from the launcher the first time a product moved.
- **The hero is the site's own sentence.** The name, the site description and how the name is said, read from the same constants as the site's metadata. Rejected: a parody of a framework's logo, a joke that tells a visitor nothing about the site.
- **One line on why.** A single paragraph and who made it; the supporters and the globe follow it unchanged.
- **The globe stays last and loads late.** Its code is fetched when the reader nears it (`about-globe`).

## Key files

| Path                                           | Role                                                               |
| :--------------------------------------------- | :----------------------------------------------------------------- |
| `apps/web/app/pages/about.vue`                 | the page: the sections in order and the globe's gate               |
| `apps/web/app/components/About/Header.vue`     | the hero: the gem, the name, the description and its pronunciation |
| `apps/web/app/components/About/Products.vue`   | a card per place, grouped as the launcher groups them              |
| `apps/web/app/components/About/Content.vue`    | the one line on why, and who made it                               |
| `apps/web/app/components/About/Supporters.vue` | the supporters, as a marquee or a carousel                         |
| `apps/web/app/services/app/ProductGroups.ts`   | the places, shared with the launcher, each with its plain line     |
