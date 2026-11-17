import type { WitnessView } from "genshin-world/parity/models/witness/WitnessView";
import type { Page } from "playwright";

declare global {
  interface Window {
    setWitnessView: (view: WitnessView) => Promise<void>;
  }
}

// Sets the parity page's witness view and waits for the frames that draw it
export const setPageWitnessView = (page: Page, view: WitnessView): Promise<void> =>
  page.evaluate((pageView) => window.setWitnessView(pageView), view);
