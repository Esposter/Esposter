import type { Compression } from "@/src/models/Compression";
import type { Encoding } from "@/src/models/Encoding";
import type { TMXNode } from "@/src/models/tmx/node/TMXNode";

export interface TMXDataNode extends TMXNode<{ encoding: Encoding; compression?: Compression | null }> {
  _: string;
}
