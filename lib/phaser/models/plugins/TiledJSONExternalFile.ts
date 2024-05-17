import type { TilemapFile } from "@/lib/phaser/models/plugins/TilemapFile";
import { TilesetFile } from "@/lib/phaser/models/plugins/TilesetFile";
import { ID_SEPARATOR } from "@/util/id/constants";
import { isPlainObject } from "@/util/object/isPlainObject";
import { InvalidOperationError, NotFoundError, Operation, parseXmlString } from "esposter-shared";
import type { TMXEmbeddedTilesetParsed, TMXExternalTilesetParsed } from "parse-tmx";
import { parseTileset } from "parse-tmx";
import type { Types } from "phaser";
import { Loader, Tilemaps, Utils } from "phaser";

const GetFastValue = Utils.Objects.GetFastValue;
const JSONFile = Loader.FileTypes.JSONFile;
const MultiFile = Loader.MultiFile;

export class TiledJSONExternalFile extends MultiFile {
  declare files: [TilemapFile, ...TilesetFile[]];

  constructor(
    loader: Loader.LoaderPlugin,
    key: string | object,
    tilemapURL?: string | object,
    path?: string | object,
    baseURL?: string | object,
    tilemapXhrSettings?: Types.Loader.XHRSettingsObject,
    tilesetXhrSettings?: Types.Loader.XHRSettingsObject,
  ) {
    if (isPlainObject(key)) {
      const configuration = key;
      key = GetFastValue(configuration, "key") as string;
      tilemapURL = GetFastValue(configuration, "url");
      tilemapXhrSettings = GetFastValue(configuration, "xhrSettings");
      path = GetFastValue(configuration, "path");
      baseURL = GetFastValue(configuration, "baseURL");
      tilesetXhrSettings = GetFastValue(configuration, "tilesetXhrSettings");
    }

    const tilemapFile = new JSONFile(loader, key, tilemapURL, tilemapXhrSettings);
    super(loader, "tilemapJSON", key, [tilemapFile]);

    this.config.path = path;
    this.config.baseURL = baseURL;
    this.config.tilesetXhrSettings = tilesetXhrSettings;
  }

  onFileComplete(file: TilemapFile) {
    const index = this.files.indexOf(file);
    if (index === -1) return;

    this.pending--;

    if (file.type === "json" && Object.prototype.hasOwnProperty.call(file.data, "tilesets")) {
      //  Inspect the data for the files to now load
      const tilesets = file.data.tilesets as TMXExternalTilesetParsed[];
      const config = this.config;
      const loader = this.loader;
      const currentBaseURL = loader.baseURL;
      const currentPath = loader.path;
      const currentPrefix = loader.prefix;
      const baseURL = GetFastValue(config, "baseURL", currentBaseURL);
      const path = GetFastValue(config, "path", currentPath);
      const prefix = GetFastValue(config, "prefix", currentPrefix);
      const tilesetXhrSettings = GetFastValue(config, "tilesetXhrSettings");

      loader.setBaseURL(baseURL);
      loader.setPath(path);
      loader.setPrefix(prefix);

      for (const [index, tileset] of tilesets.entries()) {
        if (!tileset.source) continue;

        // Tileset is relative to the tilemap filename, but we will expose our tilesets
        // in nuxt's public folder, so we just need to get the relative path past that
        const publicString = "public";
        const pathIndex = tileset.source.indexOf(publicString);
        if (pathIndex === -1) throw new NotFoundError(this.onFileComplete.name, tileset.source);

        const relativePath = tileset.source.substring(pathIndex + publicString.length);
        const tilesetFile = new TilesetFile(
          index,
          loader,
          `${file.key}${ID_SEPARATOR}Tileset${ID_SEPARATOR}${relativePath}`,
          relativePath,
          tilesetXhrSettings,
        );
        this.addToMultiFile(tilesetFile);
        loader.addFile(tilesetFile);
      }

      //  Reset the loader settings
      loader.setBaseURL(currentBaseURL);
      loader.setPath(currentPath);
      loader.setPrefix(currentPrefix);
    }
  }

  async addToCache() {
    if (!this.isReadyToProcess()) return;

    const [tilemapFile, ...tilesetFiles] = this.files;
    for (const tilesetFile of tilesetFiles) {
      const response = tilesetFile.xhrLoader?.responseText;
      if (!response) throw new InvalidOperationError(Operation.Read, this.addToCache.name, tilesetFile.url.toString());

      const responseData = await parseXmlString(response);
      const tilesetData = parseTileset(responseData.tileset) as TMXEmbeddedTilesetParsed;
      const index = tilesetFile.tilesetIndex;
      tilemapFile.data.tilesets[index] = {
        ...tilemapFile.data.tilesets[index],
        ...tilesetData,
        imagewidth: tilesetData.image.width,
        imageheight: tilesetData.image.height,
        // Avoid throwing in tilemap creator
        source: undefined,
      };
    }

    this.loader.cacheManager.tilemap.add(tilemapFile.key, {
      format: Tilemaps.Formats.TILED_JSON,
      data: tilemapFile.data,
    });
    this.complete = true;

    for (const file of this.files) file.pendingDestroy();
  }
}
