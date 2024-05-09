import type { Compression } from "@/lib/tmxParser/models/Compression";
import type { Encoding } from "@/lib/tmxParser/models/Encoding";
import type { TMXNode } from "@/lib/tmxParser/models/tmx/node/TMXNode";

export interface TMXDataNode extends TMXNode<{ encoding: Encoding; compression?: Compression | null }> {
  _: string;
}
