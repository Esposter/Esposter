import type { KitTalentRead } from "#src/models/genshinAssets/kits/module/KitTalentRead";
import type ts from "typescript";

// What reads a kit module's talent reads: the read a call makes, if it makes one, and the wrappers found so far, the
// Functions whose body is one read, which are read where they are called rather than as reads of their own
export interface KitTalentReadResolver {
  resolveTalentRead: (call: ts.CallExpression) => KitTalentRead | undefined;
  talentWrappers: ReadonlySet<ts.Node>;
}
