import type { Compression } from "@/models/Compression";
import type { Encoding } from "@/models/Encoding";
import type { TMXNode } from "@/models/tmx/node/TMXNode";

export interface TMXDataNode extends TMXNode<{ compression?: Compression; encoding: Encoding }> {
  _: string;
}
