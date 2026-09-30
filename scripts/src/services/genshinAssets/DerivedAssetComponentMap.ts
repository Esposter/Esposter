import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

// Each component's assets by the name the game gives them, which the asset index turns into the blocks holding them:
// The login screen's scene is every `LoginScene_` asset, its towers, walkway, arcades, pillars and door
export const DerivedAssetComponentMap: Record<DerivedAssetComponent, { namePattern: string }> = {
  [DerivedAssetComponent.Login]: { namePattern: "^LoginScene_" },
};
