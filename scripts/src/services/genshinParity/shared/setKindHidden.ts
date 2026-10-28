import type { Page } from "playwright";

export const setKindHidden = (page: Page, kind: string, isHidden: boolean): Promise<void> =>
  page.evaluate(
    ({ hidden, sceneKind }) => {
      Reflect.get(window, "__setSceneKindHidden")?.(sceneKind, hidden);
    },
    { hidden: isHidden, sceneKind: kind },
  );
