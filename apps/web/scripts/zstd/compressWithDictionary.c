#define ZSTD_STATIC_LINKING_ONLY
#include "zstd.h"

// Mirrors node:zlib's zstdCompress with a `dictionary` and a window: the dictionary is loaded as raw content,
// which is what node's ZSTD_CCtx_loadDictionary does, so the server's decoder reads the frame unchanged
size_t compressWithDictionary(void* destination, size_t destinationCapacity, const void* source, size_t sourceSize,
                              const void* dictionary, size_t dictionarySize, int compressionLevel, int windowLog) {
  ZSTD_CCtx* context = ZSTD_createCCtx();
  if (context == NULL) return (size_t)-1;
  size_t result = ZSTD_CCtx_setParameter(context, ZSTD_c_compressionLevel, compressionLevel);
  if (!ZSTD_isError(result)) result = ZSTD_CCtx_setParameter(context, ZSTD_c_windowLog, windowLog);
  if (!ZSTD_isError(result)) result = ZSTD_CCtx_loadDictionary(context, dictionary, dictionarySize);
  if (!ZSTD_isError(result))
    result = ZSTD_compress2(context, destination, destinationCapacity, source, sourceSize);
  ZSTD_freeCCtx(context);
  return result;
}
