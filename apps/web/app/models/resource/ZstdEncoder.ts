// What the generated zstd module exports: the compressor alone, over its own linear memory
export interface ZstdEncoder {
  compressWithDictionary: (
    destination: number,
    destinationCapacity: number,
    source: number,
    sourceSize: number,
    dictionary: number,
    dictionarySize: number,
    compressionLevel: number,
    windowLog: number,
  ) => number;
  free: (pointer: number) => void;
  malloc: (size: number) => number;
  memory: WebAssembly.Memory;
  ZSTD_compressBound: (sourceSize: number) => number;
  ZSTD_isError: (code: number) => number;
}
