import { resolve } from "node:path";

const WEB_DIRECTORY = resolve(import.meta.dirname, "../..");
// Pinned with the checksum its release publishes, so a regeneration builds the same bytes or refuses to run. The
// Version tracks the libzstd node:zlib bundles, so the browser's encoder and the server's decoder are one codec
export const ZSTD_VERSION = "1.5.7";
export const ZSTD_SOURCE_URL = `https://github.com/facebook/zstd/releases/download/v${ZSTD_VERSION}/zstd-${ZSTD_VERSION}.tar.gz`;
export const ZSTD_SOURCE_SHA256 = "eb33e51f49a15e023950cd7825ca74a4a2b43db8354825ac24fc1b7ee09e6fa3";
// Zig is the C compiler here only because it cross-compiles to wasm with its own libc and nothing installed. Its
// Release index publishes each platform's archive and checksum
export const ZIG_VERSION = "0.16.0";
export const ZIG_INDEX_URL = "https://ziglang.org/download/index.json";
export const COMPRESS_WITH_DICTIONARY_SOURCE_PATH = resolve(import.meta.dirname, "compressWithDictionary.c");
export const ZSTD_WASM_DIRECTORY = resolve(WEB_DIRECTORY, "app/generated/zstd");
export const ZSTD_WASM_PATH = resolve(ZSTD_WASM_DIRECTORY, "zstd.wasm");
// The compressor alone — the server decodes with node:zlib — with no threads, assembly or legacy formats, and
// Exporting only what the encoder calls
export const ZSTD_COMPILE_ARGUMENTS = [
  "-target",
  "wasm32-wasi",
  "-O2",
  "-flto",
  "-mexec-model=reactor",
  "-DNDEBUG",
  "-DDEBUGLEVEL=0",
  "-DZSTD_MULTITHREAD=0",
  "-DZSTD_NO_INTRINSICS",
  "-DZSTD_DISABLE_ASM",
  "-DZSTD_LEGACY_SUPPORT=0",
  "-DZSTD_STRIP_ERROR_STRINGS",
  ...["compressWithDictionary", "ZSTD_compressBound", "ZSTD_isError", "malloc", "free"].map(
    (name) => `-Wl,--export=${name}`,
  ),
  "-Wl,--strip-all",
];
