import type { ZstdEncoder } from "@/models/resource/ZstdEncoder";

import { checkIsZstdEncoder } from "@/services/resource/checkIsZstdEncoder";
import { InvalidOperationError, Operation } from "@esposter/shared";

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
