# AnimeStudio upstream defects

The Ooz source AnimeStudio vendors (`AnimeStudio.Ooz/kraken.cpp` at the pinned commit) has the defect below. This is drafted text for Escartem/AnimeStudio, kept here and not filed or posted anywhere.

**Title:** Ooz: the 8-byte match copy reads output not yet written when the match distance is under 8

- `COPY_64` and `COPY_64_ADD` copy eight bytes at once from `dst + offset`. When the distance is under eight, the source overlaps bytes this copy has not written yet, so the result depends on what the output buffer held before the call.
- Minimal repro: `AnimeStudio.CLI` on `00/10850306.blk` from game 7.1.0, `--types Texture2D`, names set to that block's `UI_NameCardPic_*` entries, `--logger_flags Warning Error`. Stock source: 398 exception lines ("EndOfStreamException", "OverflowException", and an `ArgumentOutOfRangeException` in `ProcessAssetData`) and no textures. With the copy changed to byte-wise when the distance is under eight: no exception lines and 91 textures.
- The stock decoder is also wrong with a zero-filled buffer: against the patched output, 226 of 466 Oodle calls in that block differ.
- Patch: when `dst - src < 8`, copy one byte at a time; otherwise keep the eight-byte copy.

```c
static inline void oozCopy64(void *destination, const void *source) {
  uint8_t *d = (uint8_t *)destination;
  const uint8_t *s = (const uint8_t *)source;
  if ((uintptr_t)(d - s) < 8) {
    for (int i = 0; i < 8; i++) d[i] = s[i];
  } else {
    uint64_t value;
    memcpy(&value, s, 8);
    memcpy(d, &value, 8);
  }
}
```

- Not established: why the Windows build of the same source is clean on `00/15508490`. An explanation based on x86 store-to-load forwarding is not verified and is not claimed here.
- The Leviathan defect is a separate issue, with its own text below.

**Title:** Ooz (Leviathan): `size_t` match offsets make `dst + offset` overflow, and the copy can read a stale byte

- "Leviathan_ProcessLz" takes each match's offset as a `size_t`, so `copyfrom = dst + offset` with a negative distance is pointer arithmetic that wraps. That is undefined behaviour, and the optimizer may move a copy's load ahead of the store of the copy before it when the two overlap at distance 8. The x64 build of the same source does not show it, and the arm64 build does.
- Repro: `AnimeStudio.CLI` on `00/06104869.blk` from game 7.1.0, `--group_assets ByType --game GI --types Texture2D`. That makes 604 Oodle calls. In call 601 (3022 compressed bytes, 20864 written) the first byte that differs from the x64 output is at offset 152. There the arm64 build reads 164 from byte 144, a stale value left by an earlier wild copy, where the x64 output has 0, and its output differs from x64 in 324 of 326 chunks. The build logs two exception lines and exports 483 textures where Windows exports 485.
- Patch: `size_t last_offset` becomes `ptrdiff_t last_offset` in the twelve Leviathan literal functions, and `size_t offset = -8` becomes `ptrdiff_t offset = -8`.
- Result: nine calls 595 to 603 match the x64 fingerprints on input and output, call 601 matches in all 326 chunks, and the run logs no exception line.
- Inferred, not confirmed by reading generated code: the reordering of the load is the optimizer's use of the overflow. The stale read is observed.
