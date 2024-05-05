import type { TMXNode } from "@/lib/tmxParser/models/tmx/node/TMXNode";
import type { TMXImageShared } from "@/lib/tmxParser/models/tmx/shared/TMXImageShared";

export interface TMXImageNode extends TMXNode<TMXImageShared> {}
