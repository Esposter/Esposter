import { z } from "zod";

export enum AzureContainer {
  AppAssets = "app-assets",
  ClickerAssets = "clicker-assets",
  DeadLetter = "deadletter",
  DungeonsAssets = "dungeons-assets",
  MessageAssets = "message-assets",
  PrivateUserAssets = "private-user-assets",
  PublicUserAssets = "public-user-assets",
  ResourceAssets = "resource-assets",
}

export const azureContainerSchema = z.enum(AzureContainer) satisfies z.ZodType<AzureContainer>;
