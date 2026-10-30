# Development packs

**Why not:** the official packs are published to the public game data container, which the development server and a production build both read. A pack read from the developer's folder had no reason to exist once the packs were published, and it kept a second reader of character packs beside the published one. The published reader is [published packs](../../../specs/genshin/characters/published-packs/design.md), and the three routes that served packs from elsewhere are removed with it.

The development server's scene-export route is not part of this rejection. It still serves the developer's exports of the game's scenes under `nuxt dev`, and it is specified on its own page, [development exports](../../../specs/genshin/derived-assets/development-exports/spec.md).
