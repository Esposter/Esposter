import type { GoTokenKind } from "#src/models/genshinAssets/kits/gcsim/GoTokenKind";

// One token of a Go source file, with the line it starts on
export interface GoToken {
  kind: GoTokenKind;
  line: number;
  text: string;
}
