import { type NuxtConfig } from "nuxt/schema";

export const dayjs: NuxtConfig["dayjs"] = {
  plugins: ["advancedFormat", "duration", "isToday", "isYesterday", "relativeTime"],
};
