import type { GpuCall } from "#src/models/genshinParity/shared/GpuCall";

import { roundMs } from "#src/services/genshinParity/shared/roundMs";

export const describeCall = (call: GpuCall): string =>
  `  ${roundMs(call.duration)} ms ${call.name} | ${call.label} | ${call.detail}`;
