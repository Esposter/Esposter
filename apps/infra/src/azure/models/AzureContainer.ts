// The live Blob containers. Frozen with the Azure estate: the app's buckets are `StorageBucket` now, and this file goes
// With the rest of `src/azure` at the cutover's teardown
export enum AzureContainer {
  ClickerAssets = "clicker-assets",
  DeadLetter = "deadletter",
  GenshinAssets = "genshin-assets",
  MessageAssets = "message-assets",
  PublicAppAssets = "public-app-assets",
  PublicDungeonsAssets = "public-dungeons-assets",
  PublicGenshinAssets = "public-genshin-assets",
  PublicUserAssets = "public-user-assets",
  ResourceAssets = "resource-assets",
  UserAssets = "user-assets",
}
