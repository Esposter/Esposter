import type { UserConfig } from "tsdown";

import { getTsdownConfiguration, SOURCE_CONDITION } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// Its exports carry a second arm under `SOURCE_CONDITION` pointing at `src`, so every tool that opts into that
// Condition — the tsconfig preset, the shared Vitest config — resolves this package's TypeScript directly and
// No rebuild stands between an edit here and a consumer seeing it. Node's own loader does not know the
// Condition and falls through to `dist`, which is what keeps this package loadable by anything running a
// `dist` under plain Node.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfiguration(), {
  exports: { devExports: SOURCE_CONDITION },
});

export default tsdownConfiguration;
