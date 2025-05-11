import { TMXMapParsed } from "@/models/tmx/parsed/TMXMapParsed";

export class TMXParsed {
  map: TMXMapParsed = new TMXMapParsed();

  constructor(map?: TMXMapParsed) {
    if (map) this.map = map;
  }
}
