import "phaser";

declare module "phaser" {
  namespace Loader {
    interface LoaderPlugin {
      tilemapTiledJSONExternal: InstanceType<typeof LoaderPlugin>["tilemapTiledJSON"];
    }
  }
}
