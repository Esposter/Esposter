import "phaser";

declare module "phaser" {
  namespace Loader {
    interface LoaderPlugin {
      // Each tilemap names its tilesets by file, and the app supplies the url of each one's Tiled definition by import
      tilemapTiledJSONExternal: (configuration: {
        key: string;
        tilesetURLs: Record<string, string>;
        url: object;
      }) => LoaderPlugin;
    }
  }
}
