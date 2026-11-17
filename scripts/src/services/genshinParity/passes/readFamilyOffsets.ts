import type { Vector } from "#src/models/shared/Vector";
import type { Page } from "playwright";

declare global {
  interface Window {
    getWitnessFamilyOffsets: () => Record<string, Vector>;
  }
}

export const readFamilyOffsets = (page: Page): Promise<Record<string, Vector>> =>
  page.evaluate(() => window.getWitnessFamilyOffsets());
