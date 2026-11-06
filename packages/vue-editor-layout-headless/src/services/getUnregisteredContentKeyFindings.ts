import type { Finding } from "#src/models/Finding";
import type { Layout } from "#src/models/Layout";

import { FindingKind } from "#src/models/FindingKind";

// The finding for each content key a panel names that the editor did not register, each key once however many panels name it.
// A panel names its wildcard and each of its entries, and the empty key names none
export const getUnregisteredContentKeyFindings = (layout: Layout, registeredContentKeys: string[]): Finding[] => {
  const contentKeys = layout.panels.flatMap((panel) => [
    panel.wildcardContentKey,
    ...Object.values(panel.selectionKindContentKeyMap),
  ]);
  const unregisteredContentKeys = new Set(
    contentKeys.filter((contentKey) => Boolean(contentKey) && !registeredContentKeys.includes(contentKey)),
  );
  return Array.from(unregisteredContentKeys, (contentKey) => ({
    kind: FindingKind.UnregisteredContentKey,
    subject: contentKey,
  }));
};
