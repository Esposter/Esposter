import { TMXMapParsed } from "#src/models/tmx/parsed/TMXMapParsed";

export class TMXParsed {
  map: TMXMapParsed;

  constructor(map: TMXMapParsed = new TMXMapParsed()) {
    this.map = map;
  }
}
