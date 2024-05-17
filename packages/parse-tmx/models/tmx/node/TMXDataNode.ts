import type { Compression } from "parse-tmx/models/Compression";
import type { Encoding } from "parse-tmx/models/Encoding";
import type { TMXNode } from "parse-tmx/models/tmx/node/TMXNode";

export interface TMXDataNode extends TMXNode<{ encoding: Encoding; compression?: Compression | null }> {
  _: string;
}
