import type { KitCaptureKind } from "#src/models/genshinAssets/kits/module/KitCaptureKind";

// What a captured value of a kit module is: a hit, an action, an area or a stance's actions, and whether it is a list
export interface KitCapture {
  captureKind: KitCaptureKind;
  isListed?: true;
}
