import type { ZstdEncoder } from "@/models/resource/ZstdEncoder";

// The module is built for WASI and asks the host for one thing, randomness, which the libc seeds its allocator
// With. A reactor module initializes itself once, before its first export is called
export const instantiateZstdEncoder = async (wasm: BufferSource): Promise<ZstdEncoder> => {
  let memory: undefined | WebAssembly.Memory;
  const { instance } = await WebAssembly.instantiate(wasm, {
    wasi_snapshot_preview1: {
      random_get: (pointer: number, length: number) => {
        if (memory) crypto.getRandomValues(new Uint8Array(memory.buffer, pointer, length));
        return 0;
      },
    },
  });
  // eslint-disable-next-line no-restricted-syntax -- a module's exports are typed as a record of every export kind, which no single `as` narrows to the functions this build exports
  const zstdEncoder = instance.exports as unknown as ZstdEncoder & { _initialize: () => void };
  ({ memory } = zstdEncoder);
  zstdEncoder._initialize();
  return zstdEncoder;
};
