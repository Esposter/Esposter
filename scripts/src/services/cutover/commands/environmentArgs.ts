import type { EnumArgDef } from "citty";
import type { Except } from "type-fest";

import { CutoverEnvironment } from "#src/models/cutover/CutoverEnvironment";

// The environment a step writes into. `options` and `type` are narrowed: citty types an enum's value from its options.
// It reads an optional `type` as no enum at all, so a shared constant would otherwise lose both
export const environmentArgs: Record<
  "environment",
  Except<EnumArgDef, "options" | "type"> & { options: CutoverEnvironment[]; required: true; type: "enum" }
> = {
  environment: {
    description: "The environment to copy into: develop, the dev Cloudflare resources, or production",
    options: Object.values(CutoverEnvironment),
    required: true,
    type: "enum",
  },
};
