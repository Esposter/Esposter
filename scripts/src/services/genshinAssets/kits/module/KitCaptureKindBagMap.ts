import { KitBag } from "#src/models/genshinAssets/kits/module/KitBag";
import { KitCaptureKind } from "#src/models/genshinAssets/kits/module/KitCaptureKind";

// The field of a kit's record each kind of captured value goes in
export const KitCaptureKindBagMap: Readonly<Record<KitCaptureKind, KitBag>> = {
  [KitCaptureKind.Action]: KitBag.Actions,
  [KitCaptureKind.Area]: KitBag.Areas,
  [KitCaptureKind.Hit]: KitBag.Hits,
  [KitCaptureKind.Stance]: KitBag.Stances,
};
