import { getFilename } from "#src/util/file/getFilename";
import { toXmlBlobUrl } from "#src/util/file/toXmlBlobUrl";
import { trimFileExtension } from "#src/util/file/trimFileExtension";

// The external tileset loader reads each tileset's Tiled definition from a url, keyed by the tileset's name, which is
// Its file's. The definition is read as text and handed over as a blob url, because a `.tsx` url is transformed as
// JavaScript by the dev server, which loads Nuxt's JSX plugin. The dungeon spritesheet has no definition, so it is not a
// Tileset a map names
export const TilesetUrlMap: Record<string, string> = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>("#src/assets/dungeons/tilesets/*/*.tsx", {
      eager: true,
      import: "default",
      query: "?raw",
    }),
  ).map(([path, definition]) => [trimFileExtension(getFilename(path)), toXmlBlobUrl(definition)]),
);
