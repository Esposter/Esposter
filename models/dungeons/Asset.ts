import { type Textures } from "phaser";

export interface Asset {
  key: string;
  // By default, this will be 0
  frame?: Textures.Frame & number;
}
