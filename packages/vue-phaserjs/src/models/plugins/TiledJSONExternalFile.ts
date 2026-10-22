/* oxlint-disable no-param-reassign -- Phaser file-plugin base contract reassigns loader params */
import type { TilemapFile } from "#src/models/plugins/TilemapFile";
import type { TMXExternalTilesetParsed } from "parse-tmx";
import type { Types } from "phaser";

import { TilesetFile } from "#src/models/plugins/TilesetFile";
import { ID_SEPARATOR, InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { parseTileset } from "parse-tmx";
import { Loader, Tilemaps, Utils } from "phaser";

const GetFastValue = Utils.Objects.GetFastValue;
const JSONFile = Loader.FileTypes.JSONFile;
const MultiFile = Loader.MultiFile;

export class TiledJSONExternalFile extends MultiFile {
  declare files: [TilemapFile, ...TilesetFile[]];

  constructor(
    loader: Loader.LoaderPlugin,
    key: object | string,
    tilemapURL?: object | string,
    path?: object | string,
    baseURL?: object | string,
    tilemapXhrSettings?: Types.Loader.XHRSettingsObject,
    tilesetXhrSettings?: Types.Loader.XHRSettingsObject,
  ) {
    let tilesetURLs: Record<string, string> | undefined;
    // The config-object form of the loader call, as Phaser's own tilemap file reads it
    if (typeof key !== "string") {
      const configuration = key;
      key = GetFastValue(configuration, "key") as string;
      tilemapURL = GetFastValue(configuration, "url");
      tilemapXhrSettings = GetFastValue(configuration, "xhrSettings");
      path = GetFastValue(configuration, "path");
      baseURL = GetFastValue(configuration, "baseURL");
      tilesetXhrSettings = GetFastValue(configuration, "tilesetXhrSettings");
      tilesetURLs = GetFastValue(configuration, "tilesetURLs");
    }

    const tilemapFile = new JSONFile(loader, key, tilemapURL, tilemapXhrSettings);
    super(loader, "tilemapJSON", key, [tilemapFile]);

    this.config.path = path;
    this.config.baseURL = baseURL;
    this.config.tilesetXhrSettings = tilesetXhrSettings;
    this.config.tilesetURLs = tilesetURLs;
  }

  addToCache() {
    if (!this.isReadyToProcess()) return;

    const [tilemapFile, ...tilesetFiles] = this.files;
    if (!(tilemapFile.type === "json" && Object.hasOwn(tilemapFile.data, "tilesets"))) return;
    // Every tileset is read here synchronously, so Phaser's lifecycle cannot run partway through: a call to
    // `pendingDestroy()` nulls tilemapFile.data, and loader cleanup nulls this.loader, and both are read before either.
    const tilemapData = tilemapFile.data;
    const tilemapKey = tilemapFile.key;
    const loader = this.loader;
    const files = this.files;
    // Prevent a concurrent second call before we finish (complete is normally set at the end,
    // But Phaser may call addToCache again for each tileset file completing).
    this.complete = true;

    // Each tileset lands at its own index
    for (const tilesetFile of tilesetFiles) {
      const responseText = tilesetFile.xhrLoader?.responseText;
      // Phaser types `url` as `object | string`, so the key is what reliably names the failing tileset
      if (!responseText) throw new InvalidOperationError(Operation.Read, this.addToCache.name, tilesetFile.key);

      const tilesetData = parseTileset(responseText).match(
        (parsedTileset) => parsedTileset,
        (error) => {
          throw error;
        },
      );
      const index = tilesetFile.tilesetIndex;
      Object.assign(tilemapData.tilesets[index], tilesetData, {
        imageheight: tilesetData.image?.height,
        imagewidth: tilesetData.image?.width,
        // Avoid throwing in tilemap creator
        source: undefined,
      });
    }

    loader.cacheManager.tilemap.add(tilemapKey, { data: tilemapData, format: Tilemaps.Formats.TILED_JSON });

    for (const file of files) file.pendingDestroy();
  }

  override onFileComplete(file: TilemapFile) {
    const index = this.files.indexOf(file);
    if (index === -1) return;

    this.pending--;

    if (!(file.type === "json" && Object.hasOwn(file.data, "tilesets"))) return;
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

    const tilesetURLs = GetFastValue(config, "tilesetURLs") as Record<string, string> | undefined;
    for (const [tilesetIndex, tileset] of tilesets.entries()) {
      // A tileset is named by its file, and the app supplies each one's url by import, so a tileset may live anywhere
      const tilesetName =
        tileset.source
          .split("/")
          .pop()
          ?.replace(/\.tsx$/u, "") ?? "";
      const tilesetURL = tilesetURLs?.[tilesetName];
      if (!tilesetURL) throw new NotFoundError(this.onFileComplete.name, tileset.source);

      const tilesetFile = new TilesetFile(
        tilesetIndex,
        loader,
        `${file.key}${ID_SEPARATOR}Tileset${ID_SEPARATOR}${tilesetName}`,
        tilesetURL,
        tilesetXhrSettings,
      );
      this.addToMultiFile(tilesetFile);
      loader.addFile(tilesetFile);
    }
    // Reset the loader settings.
    loader.setBaseURL(currentBaseURL);
    loader.setPath(currentPath);
    loader.setPrefix(currentPrefix);
  }
}
