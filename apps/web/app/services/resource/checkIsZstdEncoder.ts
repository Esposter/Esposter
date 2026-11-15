import type { ZstdEncoder } from "#src/models/resource/ZstdEncoder";

import { ZSTD_FUNCTION_EXPORTS } from "#src/services/resource/constants";

// The exports a module's instance carries are a record of every export kind; this narrows it to the compressor by checking
// Each name it needs, so no cast is needed
export const checkIsZstdEncoder = (
  moduleExports: WebAssembly.Exports,
): moduleExports is WebAssembly.Exports & ZstdEncoder & { _initialize: () => void } =>
  moduleExports.memory instanceof WebAssembly.Memory &&
  ZSTD_FUNCTION_EXPORTS.every((name) => typeof moduleExports[name] === "function");
