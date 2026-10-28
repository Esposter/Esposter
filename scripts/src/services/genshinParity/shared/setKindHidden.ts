/* oxlint-disable no-underscore-dangle -- the names are the page's own globals, which the page sets and these read back by name */

import type { Page } from "playwright";

export const setKindHidden = (page: Page, kind: string, isHidden: boolean): Promise<void> =>
  page.evaluate(
    ({ hidden, sceneKind }) => {
      window.__setSceneKindHidden?.(sceneKind, hidden);
    },
    { hidden: isHidden, sceneKind: kind },
  );
