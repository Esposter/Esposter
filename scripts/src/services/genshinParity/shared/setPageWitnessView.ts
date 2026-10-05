import type { WitnessView } from "genshin-world/parity/witness/WitnessView";
import type { Page } from "playwright";

// Sets the parity page's witness view and waits for the frames that draw it
export const setPageWitnessView = (page: Page, view: WitnessView): Promise<void> =>
  page.evaluate(
    (pageView) => (Reflect.get(window, "setWitnessView") as (view: WitnessView) => Promise<void>)(pageView),
    view,
  );
