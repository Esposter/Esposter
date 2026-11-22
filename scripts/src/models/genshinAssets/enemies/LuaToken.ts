import type { LuaTokenKind } from "#src/models/genshinAssets/enemies/LuaTokenKind";

export interface LuaToken {
  kind: LuaTokenKind;
  text: string;
}
