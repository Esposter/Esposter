import { z } from "zod";

// Every container is private unless its name says `public-`, so a public one is always visible in its name
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

export const azureContainerSchema = z.enum(AzureContainer) satisfies z.ZodType<AzureContainer>;
