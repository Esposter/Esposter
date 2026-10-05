import type { Sprite } from "three";
import type { UniformNode } from "three/webgpu";

// A band of clouds as its one sprite: the share of its clouds drawn, its material's release, and its clouds' places in
// The order they were given, for a band that moves to rewrite in place
export interface CloudBandSprite {
  cover: UniformNode<"float", number>;
  dispose: () => void;
  places: [number, number, number][];
  sprite: Sprite;
}
