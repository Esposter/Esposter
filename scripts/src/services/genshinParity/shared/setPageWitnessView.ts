import type { PageWitnessView } from "#src/models/genshinParity/shared/PageWitnessView";
import type { Page } from "playwright";

// Sets the parity page's witness view and waits for the frames that draw it
export const setPageWitnessView = (page: Page, view: PageWitnessView): Promise<void> =>
  page.evaluate(
    (pageView) => (Reflect.get(window, "setWitnessView") as (view: PageWitnessView) => Promise<void>)(pageView),
    view,
  );
