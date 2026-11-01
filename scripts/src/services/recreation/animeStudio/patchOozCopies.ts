import { replaceOnce } from "#src/services/recreation/animeStudio/replaceOnce";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Ooz copies a match eight bytes at a time, which reads unwritten bytes when the match is closer than eight bytes.
// Such copies take a byte at a time, so the output no longer depends on what the buffer held before.
const OOZ_COPY_64 = `static inline void oozCopy64(void *destination, const void *source) {
  uint8_t *d = (uint8_t *)destination;
  const uint8_t *s = (const uint8_t *)source;
  if ((uintptr_t)(d - s) < 8) {
    for (int i = 0; i < 8; i++)
      d[i] = s[i];
  } else {
    uint64_t value;
    memcpy(&value, s, 8);
    memcpy(d, &value, 8);
  }
}

static inline void oozCopy64Add(void *destination, const void *literals, const void *window) {
  uint8_t *d = (uint8_t *)destination;
  const uint8_t *t = (const uint8_t *)window;
  if ((uintptr_t)(d - t) < 8) {
    for (int i = 0; i < 8; i++)
      d[i] = (uint8_t)(((const uint8_t *)literals)[i] + t[i]);
  } else {
    simde_mm_storel_epi64((simde__m128i *)destination, simde_mm_add_epi8(simde_mm_loadl_epi64((simde__m128i *)literals), simde_mm_loadl_epi64((simde__m128i *)window)));
  }
}

#define COPY_64(d, s) oozCopy64((d), (s))\n`;
const OOZ_COPY_64_ADD = "#define COPY_64_ADD(d, s, t) oozCopy64Add((d), (s), (t))\n";

// The one edit to Ooz's own source, replacing its match copy macros with the overlap-safe copies above.
// The pinned commit's macro text is matched exactly, so a bumped commit that moved them fails here.
export const patchOozCopies = (oozDirectory: string): void => {
  const path = join(oozDirectory, "kraken.cpp");
  const source = readFileSync(path, "utf8");
  const patched = replaceOnce(
    replaceOnce(source, /#define COPY_64\(d, s\)[\s\S]*?\n {4}\}\n/u, OOZ_COPY_64),
    /#define COPY_64_ADD\(d, s, t\) [^\n]*\n/u,
    OOZ_COPY_64_ADD,
  );
  writeFileSync(path, patched);
};
