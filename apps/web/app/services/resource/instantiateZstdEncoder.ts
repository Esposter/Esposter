import type { ZstdEncoder } from "@/models/resource/ZstdEncoder";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The functions the compressor's own exports are checked for, each by its runtime kind
const ZSTD_FUNCTION_EXPORTS = [
  "_initialize",
  "compressWithDictionary",
  "free",
  "malloc",
  "ZSTD_compressBound",
  "ZSTD_isError",
] as const;

// The exports a module's instance carries are a record of every export kind; this narrows it to the compressor by checking
// Each name it needs, so no cast is needed
const checkIsZstdEncoder = (
  moduleExports: WebAssembly.Exports,
): moduleExports is WebAssembly.Exports & ZstdEncoder & { _initialize: () => void } =>
  moduleExports.memory instanceof WebAssembly.Memory &&
  ZSTD_FUNCTION_EXPORTS.every((name) => typeof moduleExports[name] === "function");

// The module is built for WASI and asks the host for one thing, randomness, which the libc seeds its allocator
// With. A reactor module initializes itself once, before its first export is called
export const instantiateZstdEncoder = async (wasm: BufferSource): Promise<ZstdEncoder> => {
  const { instance } = await WebAssembly.instantiate(wasm, {
    wasi_snapshot_preview1: {
      // Called only from an export, so the module's memory exists by the time it runs
      random_get: (pointer: number, length: number) => {
        const { memory } = instance.exports;
        if (!(memory instanceof WebAssembly.Memory))
          throw new InvalidOperationError(Operation.Read, "zstd module", "lacks its memory");
        crypto.getRandomValues(new Uint8Array(memory.buffer, pointer, length));
        return 0;
      },
    },
  });
  const { exports: moduleExports } = instance;
  if (!checkIsZstdEncoder(moduleExports))
    throw new InvalidOperationError(Operation.Read, "zstd module", "lacks its compressor exports");
  // oxlint-disable-next-line no-underscore-dangle -- `_initialize` is the WASI reactor ABI's own export name
  moduleExports._initialize();
  return moduleExports;
};
