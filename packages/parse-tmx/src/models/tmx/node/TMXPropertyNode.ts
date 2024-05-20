import type { TMXNode } from "@/models/tmx/node/TMXNode";

export interface TMXPropertyNode extends TMXNode<{ name: string; value?: string }> {
  // Phaser stores string with special unicode values as data
  // instead of the value attribute, which is why value can be undefined
  _: string;
}
