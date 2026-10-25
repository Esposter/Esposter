import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { formatProducerStaleness } from "#src/services/producerStamp/formatProducerStaleness";
import { readProducerStaleness } from "#src/services/producerStamp/readProducerStaleness";

export const warnProducerStaleness = async (component: DerivedAssetComponent, root: string): Promise<void> => {
  const warning = formatProducerStaleness(component, await readProducerStaleness(root));
  if (warning) console.warn(warning);
};
