import type { Vector } from "#src/models/shared/Vector";
import type { Page } from "playwright";

export const readFamilyOffsets = (page: Page): Promise<Record<string, Vector>> =>
  page.evaluate(() => (Reflect.get(window, "getWitnessFamilyOffsets") as () => Record<string, Vector>)());
