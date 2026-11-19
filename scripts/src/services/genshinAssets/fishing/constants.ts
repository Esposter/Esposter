import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

// The official map's label of a fishing point, from its label tree as the points were read
export const FISHING_POINT_LABEL_ID = 261;
// The kind every fishing point is placed as, the one kind the fishing points' fit carries
export const FISHING_POINT_KIND = "fishing";
// The fishing-area props among a region's placements, by the names the game gives them: a fishing prop, a fish stand, a
// Fish-shaped prop or a fishing pole. A light named for fishing is no prop, so the `Prop_` before the name is required
export const FISHING_PROP_NAME_PATTERN = /^Area_\w*Prop_\w*(?:[Ff]ish|Pole)/u;
// The regions whose witness layouts hold a fishing-area prop, each read for its placements
export const FISHING_PROP_COMPONENTS: readonly DerivedAssetComponent[] = [
  DerivedAssetComponent.Mondstadt,
  DerivedAssetComponent.Liyue,
  DerivedAssetComponent.Inazuma,
  DerivedAssetComponent.Natlan,
];
