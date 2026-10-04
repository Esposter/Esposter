import type { Page } from "playwright";

// A view of the witness render as the parity page's `setWitnessView` takes it: a camera pose in three's axes (angles in
// Radians but the field of view, in degrees), the families of parts the witness draws in place of the scene's own,
// Whether the scene draws alone, and how far each family stands off its place
export interface PageWitnessView {
  camera?: { fov: number; pitch: number; position: [number, number, number]; yaw: number };
  families?: string[];
  familyOffsets?: Record<string, [number, number, number]>;
  familyScales?: Record<string, number>;
  isAlone?: boolean;
}
// Sets the parity page's witness view and waits for the frames that draw it
export const setPageWitnessView = (page: Page, view: PageWitnessView): Promise<void> =>
  page.evaluate(
    (pageView) => (Reflect.get(window, "setWitnessView") as (view: PageWitnessView) => Promise<void>)(pageView),
    view,
  );
