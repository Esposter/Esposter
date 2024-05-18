import { Loader } from "phaser";

const XMLFile = Loader.FileTypes.XMLFile;

export class TilesetFile extends XMLFile {
  tilesetIndex: number;

  constructor(tilesetIndex: number, ...args: ConstructorParameters<typeof XMLFile>) {
    super(...args);
    this.tilesetIndex = tilesetIndex;
  }
}
