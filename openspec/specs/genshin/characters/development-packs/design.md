# Development packs

Under `nuxt dev`, the app's module `apps/web/modules/serveGenshinExtractions.ts` registers the route the world reads the developer's own exports of the game's scenes from ([development exports](../../derived-assets/development-exports/design.md)). It returns before registering anything unless Nuxt runs under `nuxt dev`, since a route that refused outside development would still be bundled into the production server. That early return is the module's only guard: it imports only the route's base URL and registers the handler by its path, and the handler checks nothing about development.

No character pack is read from the developer's disk: the browser reads each character's model from the public container ([published packs](../published-packs/design.md)).

## Key files

| File                                          | Role                                                    |
| :-------------------------------------------- | :------------------------------------------------------ |
| `apps/web/modules/serveGenshinExtractions.ts` | Registers the scene export route under `nuxt dev` alone |
