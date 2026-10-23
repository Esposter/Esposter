import type { TiledJSONExternalConfiguration } from "#src/models/plugins/TiledJSONExternalFile";

import { TiledJSONExternalFile } from "#src/models/plugins/TiledJSONExternalFile";
import { TILEMAP_TILED_JSON_EXTERNAL_KEY } from "#src/services/shared/constants";
import { Loader } from "phaser";

const FileTypesManager = Loader.FileTypesManager;

export const registerTiledJSONExternalLoader = () => {
  FileTypesManager.register(
    TILEMAP_TILED_JSON_EXTERNAL_KEY,
    function (
      this: Loader.LoaderPlugin,
      configuration: TiledJSONExternalConfiguration | TiledJSONExternalConfiguration[],
    ) {
      //  Supports an Object file definition in the configuration argument
      //  Or an array of objects in the configuration argument
      for (const configurationElement of Array.isArray(configuration) ? configuration : [configuration]) {
        const multifile = new TiledJSONExternalFile(this, configurationElement);
        this.addFile(multifile.files);
      }

      return this;
    },
  );
};
