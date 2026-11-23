import type { UserConfig } from "tsdown";

import { getTsdownConfiguration } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// The in-memory Cache Storage the suites of genshin-world share with this package, built as an entry of its own so the barrel does not export it
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfiguration(), {
  entry: { createHostedAssetCacheStub: "src/services/createHostedAssetCacheStub.ts", index: "src/index.ts" },
});

export default tsdownConfiguration;
