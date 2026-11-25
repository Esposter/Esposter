# Static assets

A static file lives in one of three places, and the choice is a rule. `apps/web/app/assets/` holds every file the app's code reads: the bundler gives each one a content-hashed URL, the browser caches it for good, a missing file fails the build, and a small one is inlined into the code that imports it, except a call background, whose url the call and the picker read. `apps/web/public/` holds only the files whose URL must be the same from one build to the next, because something outside the bundle names that URL. The hosted bucket holds the data a product's code reads at runtime that is too large to bundle, or that a screen fetches only when it needs it: each object is named by the sha256 of its bytes, a product's committed lock names every object it reads, and the object is served from the hosted origin under its scope, so a changed file is a new url and the older one is never read again.

## Which place

```mermaid
flowchart TD
  File["A static file"] --> Named{"Is its URL named by config, the document head, the manifest, a worker or the browser?"}
  Named -->|yes| Public["apps/web/public/, at a fixed path"]
  Named -->|no| Built{"Does a library build its URL at runtime?"}
  Built -->|yes| Public
  Built -->|no| Hosted{"Is it runtime data too large to bundle or fetched on demand?"}
  Hosted -->|yes| Bucket["The hosted bucket, under its product's lock"]
  Hosted -->|no| Assets["apps/web/app/assets/, imported by the code that reads it"]
```

A bundled URL changes whenever the file's bytes change, so anything that names a file by its URL outside the bundle has to stay in `public/`. These do:

- **A URL named by config or the document head.** The files under `configuration/` run in Node and cannot import from the app, so the head links, the manifest's icons and the polyfill head script name their files by path: `pwa/` and `polyfills/`. The service worker is not among them: the module bundles `service-worker/sw.ts` from source, so nothing names it by URL.
- **A file the browser requests by a fixed name.** `favicon.ico` is requested from the root whatever the page says. The apple and manifest icons are linked by their `pwa/` paths, so no icon sits at the root.
- **A file a library requests by a name it builds at runtime.** The PDF renderer asks for a text annotation's icon as `annotation-<name>.svg` beside the folder the app names, so no import can name the file, and the URL has to be the same from one build to the next. The icons are copied into `public/pdfjs/images/` at the renderer's pinned version, with a notice beside them. A Nitro mount from the renderer's install, which the other renderer folders take, is not used here: its `publicAssets` entry needs a `dir` key that the `id-denylist` lint rule rejects.

Everything else is in `app/assets/`, unless it is a data set the hosted bucket holds, which the hosted-assets system publishes and reads: see [hosted game data](../../genshin/hosted-game-data/design.md) for the first product. Packages whose files the server must hand out come from their own installs through Nitro's `publicAssets` (`apps/web/configuration/nitro.ts`), as the [polyfills](../polyfills/design.md) page describes for the polyfills a package ships. The renderer's annotation icons are the one exception, as the list above says.

## Saved data names an identifier, never a URL

A value a user's data stores is a name the code resolves to a URL when it reads it. A call background is saved as its preset's member, `CallVirtualBackground.Sunrise`, and `CallVirtualBackgroundUrlMap` resolves that member to the bundled URL of its file. The map is typed over every member, so a preset added to the value set without its file fails the typecheck. A rebuild changes the URL but not the name, so a saved setting never goes stale.

The value set follows the repo's convention: each member's value is spelled like its key, and the set has no `None` member. "No background" is the empty string the setting already defaults to, and the definitions list it as the first entry with an empty `id`, so the picker draws its tile from the same markup as every other preset. A separate None control would repeat the tile's markup, so there is none. Absence is never a member of a value set, as the `typescript` skill's value-set reference says.

## How a bundled file is read

A loader takes any URL, so a bundled URL needs no special handling in Phaser or three.js: `scene.load.image(key, url)` and `textureLoader.load(url)` read it the same as a path under `public/`. The import names the file where it is read, and the URL is the import's value:

```ts
import roughnessUrl from "#src/assets/visual/textures/roughness.jpeg";

textureLoader.load(roughnessUrl);
```

An image's default import is its URL, and a glTF model's too, since `configuration/vite.ts` lists it in `assetsInclude`. A `#src` name carries no query, because the manifest substitutes the whole specifier into its pattern, so a file read another way passes its query as an `import.meta.glob` option: the privacy policy's HTML with `query: "?raw"`, a string in its route's chunk that needs no request, the zstd module with `"?url"`, and a worker with `"?worker"`. The file is never named by a string path in the source, so a missing file is a build error rather than a 404 found at runtime.

A 3D engine's bundled file is named into `_nuxt/engine/` by `configuration/vite.ts`, since it is loaded by URL at runtime and the service worker's precache leaves that folder out (`configuration/pwa.ts`). The folder is the only mark a hashed file name keeps of its source.

A bundled URL is the same on both renders. Nuxt writes an imported asset's URL through its `__buildAssetsURL` helper on the server, root-relative, and resolves it against the importing chunk on the client, which reads back absolute, so every server-rendered `<img>` of an imported asset hydrated as a mismatch. `viteHooks` in `configuration/vite.ts` has a client chunk ask the same helper, which keeps a configured CDN URL working, since the helper is what applies it.

A dev server and a build still disagree on a bundled URL's space. The dev server encodes it (`%20`), while the build writes the URL through `__buildAssetsURL`, which joins without encoding, so the build keeps it raw. A loader takes either form, but a `srcset` splits on a raw space, so a consumer that puts a bundled URL in one encodes its spaces, as the clicker's icon map does (`apps/web/app/services/clicker/icon/toIconMap.ts`).

A Tiled tileset is named in a map by a relative `source` path, the form the Tiled editor writes, so each map's `index.tmx` and the `tilemap.json` beside it keep that path. The runtime does not follow the path. The external tileset loader in `packages/vue-phaserjs` takes each tileset's Tiled definition from a url, keyed by the tileset's name. The dungeons game's maps and definitions are hosted objects: `loadTilemaps` builds each map's url and each `.tsx` url from the dungeons key map, so a map loads by its url and the loader requests each definition from its own hosted url. A move still edits the relative paths in each map, because the editor needs them. The `.tsx` and `tilemap.json` files stay in `app/assets/dungeons/`, the Tiled tree the editor and `tiled:gen` read, and the bundle holds none of them.

## Shared code stays out of asset imports

A file under `shared/` is parsed by the server and read by the Nuxt config in Node, so it cannot import from `app/assets/`. A constant that names a bundled file lives beside the code that reads it, in `app/`. What `shared/` may name is a path the config or the server reads, so `PWA_PUBLIC_FOLDER_PATH` stays there.

## Limits on what ships

Two rules hold for every tracked file under `apps/web/app/assets/` and `apps/web/public/`, and `scripts/src/workspace/templates/staticAssets.test.ts` enforces both over the files git lists:

- **Audio is compressed.** No `.wav`, `.aiff` or `.flac` file is tracked there. A sound is an MP3, the format the dungeons' other music and sound effects already use. An uncompressed two-minute track runs toward the per-file limit that Workers static assets set, and its MP3 is a small fraction of its size.
- **No bundled file is over the precache limit.** The service worker precaches the build's code, styles, images and fonts, the extensions `PRECACHE_EXTENSIONS` lists (`packages/unplugin-pwa-nuxt/src/services/constants.ts`), and leaves one of those past the limit out of its list with a warning (`apps/web/configuration/pwa.ts`). A bundled audio file is not a precache candidate, since no audio extension is listed, and a file a game or 3D engine loads by URL sits under `_nuxt/engine/`, which the app's `globIgnores` leaves out, so the page fetches either when it needs it; the test holds every served file to the limit regardless. An image past the limit is converted to lossless WebP, which keeps its pixels exact and which Phaser's `load.image` reads. The test names the limit once, in its `SIZE_LIMIT_BYTES`.

## Rejected

- **Every static file in `public/`.** It loses the content hash, the immutable cache and the build-time check, and every texture and tileset path becomes an unchecked string.
- **Game data bundled, or kept in `public/`.** A data set too large to bundle would grow every build and every client's first load, and one kept in `public/` has a fixed url that a changed file would still answer with the old bytes. The hosted bucket names each object by its hash, so a changed file is a new url and the cache can hold it for good.
- **Every static file bundled.** The head links, the manifest and the polyfill script cannot take a bundled URL, since config is read in Node and those files name a fixed path.
- **Saving a bundled URL as user data.** Each edit to a file's bytes would change the URL, so a saved value would silently stop matching. A file under the inline limit would also be inlined into the saved value as a data URL. The fix is the identifier above, not keeping the file in `public/`.
- **Textures kept in `public/` because Phaser needs a path.** Phaser and three.js read any URL, bundled ones included, so the constraint never came from the loader.
- **Tilesets kept in `public/` because the external loader fetched them by a path under a `public` segment.** That derived each tileset's url from the folder name in its `source`, so a tileset anywhere else threw. The loader takes the url of each tileset from the app's import, which is the same rule every other file follows.
- **Tilesets as `data:` urls.** Phaser decodes every data url as base64, and then `XHRLoader` returns `undefined` and overwrites the file's `xhrLoader` with it, so the tileset's text never reaches the loader. A `blob:` url is passed through unchanged and loaded with a real XHR.
- **`@nuxtjs/seo`'s skew protection, taken as a new default.** It keeps earlier builds' assets in a cache folder on the build's own disk, and a CI build starts on a fresh disk, so it retained nothing and every build reported its first release. It also rewrites `builds/latest.json` and `builds/meta/<id>.json` before Nuxt writes them again, so Nitro serves each at the longer size over a shorter file: the response ends early, the edge answers 502, and the service worker's precache of the app manifest fails its whole install, so the worker no longer precaches it (`packages/unplugin-pwa-nuxt`). It stays off in `apps/web/configuration/skewProtection.ts` until it retains builds in storage that outlives a deploy and leaves those two files as Nuxt wrote them.
- **`@nuxtjs/seo`'s OG image module, taken as a default.** No page defines an image and no route rule names one, so it renders nothing, yet it still copies two Inter font files into the build's public folder and mounts the routes that serve them. It stays off in `apps/web/configuration/ogImage.ts`. A page that defines an image turns it back on there, and its fonts then come back into `public/`.
- **A positional tileset-url argument on the external loader.** The loader takes one configuration object, which carries `tilesetURLs` beside the map's own fields. A positional form would need that map as a seventh argument after six others, and every new field would add another position; the only caller uses the object form.

## Key files

| File                                                                          | Role                                                                                                   |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `apps/web/app/assets/`                                                        | Every file the app's code reads, imported where it is read                                             |
| `apps/web/configuration/vite.ts`                                              | `viteHooks`: client asset URLs via the helper; `assetsInlineLimit`: call backgrounds are files         |
| `apps/web/app/assets/dungeons/tilesets/`                                      | The Tiled tilesets, each `.tsx` beside its image, hosted by the dungeons publish and loaded by url     |
| `apps/web/app/assets/visual/textures/`                                        | The gem model and the textures the visual scenes and the fluid simulator load                          |
| `apps/web/app/assets/message/room/call/backgrounds/`                          | The call background images, kept as files and resolved from their preset ids                           |
| `apps/web/app/services/dungeons/loader/loadTilesets.ts`                       | Each tileset's image or spritesheet, loaded by its hosted url from the dungeons key map                |
| `apps/web/app/services/dungeons/loader/loadTilemaps.ts`                       | Each map's Tiled JSON and each tileset's `.tsx` definition, loaded by its hosted url                   |
| `packages/vue-phaserjs/src/models/plugins/TiledJSONExternalFile.ts`           | Reads a map's external tilesets from the URL map, never from a folder name                             |
| `apps/web/app/models/message/room/call/CallVirtualBackground.ts`              | The preset ids a user's setting saves, one member per background                                       |
| `apps/web/app/services/message/room/call/CallVirtualBackgroundDefinitions.ts` | The preset list, built from the value set, each URL read from `CallVirtualBackgroundUrlMap`            |
| `apps/web/app/store/message/user/settings/callBackground.ts`                  | Resolves a saved preset id back to its URL                                                             |
| `apps/web/public/`                                                            | The files whose URL is fixed, listed under Which place                                                 |
| `packages/hosted-assets/src/services/getHostedAssetUrl.ts`                    | The url an object is served at under an origin: its scope, then its sha256                             |
| `scripts/src/services/hostedAssets/getHostedAssetProducts.ts`                 | The one declaration of the products the hosted bucket holds, each with its scope and its lock          |
| `apps/web/public/pdfjs/images/`                                               | The renderer's annotation icons, copied from its install, with the notice of their licence beside them |
| `apps/web/configuration/app.ts`                                               | The head links and the polyfill script, named by their public paths                                    |
| `apps/web/configuration/pwa.ts`                                               | The manifest's icons, named by their public paths                                                      |
| `apps/web/service-worker/sw.ts`                                               | The service worker, bundled from source with the precache list injected, so it has no public path      |
| `apps/web/configuration/nitro.ts`                                             | The `publicAssets` mounts that serve package files from their installs                                 |
| `apps/web/configuration/skewProtection.ts`                                    | Turns off `@nuxtjs/seo`'s skew protection, for the reasons under Rejected                              |
| `apps/web/configuration/ogImage.ts`                                           | Turns off `@nuxtjs/seo`'s OG image module, for the reasons under Rejected                              |
| `apps/web/configuration/typescript.ts`                                        | Excludes the Tiled `.tsx` sources from the app's TypeScript include                                    |
| `apps/web/shared/services/app/constants.ts`                                   | `PWA_PUBLIC_FOLDER_PATH`, the one public path the config reads                                         |
| `scripts/src/workspace/templates/staticAssets.test.ts`                        | Enforces the two limits under Limits on what ships, over every tracked file in the two folders         |

## Notes

- **The build folder's lifetimes are named per file.** Cloudflare joins every `_headers` rule a path matches, so the folder's one immutable rule would also stamp `builds/latest.json`, which the outdated-build check polls. `apps/web/configuration/routeRules.ts` gives the hashed files their rules by placeholder, so `builds/:file` alone carries the revalidating lifetime. A new subfolder under `_nuxt/` needs its own rule, or its files get no lifetime.
- **Settings that hold a path rather than a preset id match no preset.** They read as no background, and nothing migrates them, since the app keeps no compatibility shims for saved values.
