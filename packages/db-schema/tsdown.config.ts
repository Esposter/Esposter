import type { UserConfig } from "tsdown";

import { getTsdownConfiguration } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// Each object's migrations are built as an entry of their own, since the realtime Worker imports each by its subpath. Their
// `.sql` files are text the Worker bundles, so the build reads them as text too, and no other package's graph reaches them
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfiguration(), {
  entry: [
    "src/index.ts",
    "src/objects/call/migrations/migrations.js",
    "src/objects/room/migrations/migrations.js",
    "src/objects/user/migrations/migrations.js",
  ],
  loader: { ".sql": "text" },
});

export default tsdownConfiguration;
