import type { Compression } from "@/models/Compression";
import type { Encoding } from "@/models/Encoding";
import type { TMXNode } from "@/models/tmx/node/TMXNode";

export interface TMXDataNode extends TMXNode<{ encoding: Encoding; compression?: Compression | null }> {
  _: string;
}
