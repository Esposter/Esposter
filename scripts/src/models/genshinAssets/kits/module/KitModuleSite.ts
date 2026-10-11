import type { KitCaptureKind } from "#src/models/genshinAssets/kits/module/KitCaptureKind";
import type { KitModuleSiteKind } from "#src/models/genshinAssets/kits/module/KitModuleSiteKind";
import type { KitParameter } from "genshin-world";

// A place in a kit module's text a value of its record is read from: its id by its place in the text, how it holds its
// Value, the name the value goes by, the expression a probe reads it again with, and its line
export interface KitModuleSite {
  // What a capture is, or the literal a field sits in
  captureKind?: KitCaptureKind;
  // The site of a binding this site's value is derived into, which this site stands in for where that binding's value
  // Is no parameter of its own
  derivedSiteId?: string;
  expressionText: string;
  // The key a field sets in its literal
  fieldKey?: string;
  id: string;
  // Whether a value's binding is a frame count divided by the frames in a second, so it holds seconds
  isFramesAsSeconds?: true;
  // Whether a capture is a list of hits, actions or areas
  isListed?: true;
  kind: KitModuleSiteKind;
  line: number;
  // The literal a field sits in, by its place in the text
  literalId?: string;
  name: string;
  // A talent's parameters, more than one where its index is a choice of constants, none where it is chosen only as the
  // Kit plays
  parameters?: Exclude<KitParameter, number>[];
}
