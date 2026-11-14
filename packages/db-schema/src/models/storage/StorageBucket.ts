import { z } from "zod";

// Every bucket is private unless its name says `public-`, so a public one is always visible in its name. Each name is
// also its R2 bucket's name
export const StorageBucket = {
  ClickerAssets: "clicker-assets",
  GenshinAssets: "genshin-assets",
  MessageAssets: "message-assets",
  PublicAppAssets: "public-app-assets",
  PublicDungeonsAssets: "public-dungeons-assets",
  PublicGenshinAssets: "public-genshin-assets",
  PublicUserAssets: "public-user-assets",
  ResourceAssets: "resource-assets",
  UserAssets: "user-assets",
} as const;
export type StorageBucket = (typeof StorageBucket)[keyof typeof StorageBucket];

export const storageBucketSchema = z.enum(StorageBucket) satisfies z.ZodType<StorageBucket>;
