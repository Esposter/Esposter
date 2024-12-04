import type { TupleSlice } from "@esposter/shared";

import { TiledJSONExternalFile } from "@/models/plugins/TiledJSONExternalFile";
import { TILEMAP_TILED_JSON_EXTERNAL_KEY } from "@/util/constants";
import { Loader } from "phaser";

const FileTypesManager = Loader.FileTypesManager;

export const registerTiledJSONExternalLoader = () => {
  FileTypesManager.register(
    TILEMAP_TILED_JSON_EXTERNAL_KEY,
    function (this: Loader.LoaderPlugin, ...args: TupleSlice<ConstructorParameters<typeof TiledJSONExternalFile>, 1>) {
      const [key, tilemapURL, path, baseURL, tilemapXhrSettings, tilesetXhrSettings] = args;
      //  Supports an Object file definition in the key argument
      //  Or an array of objects in the key argument
      //  Or a single entry where all arguments have been defined
      if (Array.isArray(key))
        for (const keyElement of key) {
          const multifile = new TiledJSONExternalFile(this, keyElement);
          this.addFile(multifile.files);
        }
      else {
        const multifile = new TiledJSONExternalFile(
          this,
          key,
          tilemapURL,
          path,
          baseURL,
          tilemapXhrSettings,
          tilesetXhrSettings,
        );
        this.addFile(multifile.files);
      }

      return this;
    },
  );
};
