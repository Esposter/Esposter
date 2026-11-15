# Tasks

Every test builds its bytes in the test itself: no game file is committed, and CI holds none. The dump command, run on the owner's installs, is the check against the real data.

## 1. Archives

- [ ] 1.1 Create the ed6-formats package from the shared package configuration, with its row in the `AGENTS.md` package table, and read an archive index. Verify: tests named after the scenarios 'An index lists its named entries' and 'Bytes without the index magic are refused' written first and seen failing.
- [ ] 1.2 Port the uyjulian script's two decompression modes and the frame loop, with its MIT notice kept. Verify: tests named after the scenarios 'A compressed entry comes back decompressed' and 'A back-reference before the window's start fails the read' written first and seen failing.
- [ ] 1.3 Read an entry from its archive data by the compressed-entry rule. Verify: tests named after the scenarios 'A stored entry comes back as it is' and 'A hidden DDS is never decompressed' written first and seen failing.

## 2. Images

- [ ] 2.1 Read an uncompressed 16- or 32-bit DDS as RGBA. Verify: tests named after the scenarios 'A 16-bit DDS reads as RGBA' and 'A block-compressed DDS is refused' written first and seen failing.
- [ ] 2.2 Read a raw `._CH` sheet by the caller's format or the format table, seeded from the uyjulian script's table. Verify: tests named after the scenarios 'A raw sheet reads in its listed format' and 'A sheet with no known format is refused' written first and seen failing.
- [ ] 2.3 Read the `._CP` record layout from Kiseki-Texture-Tool's source for its facts, and compose a chip sheet from it. Verify: tests named after the scenarios 'A chip layout draws its tiles' and 'A layout naming a missing tile is refused' written first and seen failing.
- [ ] 2.4 Read a `._DA` font. Verify: a test named after the scenario 'A font's grey becomes alpha' written first and seen failing.

## 3. Scena

- [ ] 3.1 Build the scena opcode table from Calmare and EDDecompiler's facts, and read a script into its functions and instructions. Verify: tests named after the scenarios 'A script reads as its functions' and 'An unknown opcode stops the read' written first and seen failing.
- [ ] 3.2 Decode text operands from code page 932 with Falcom's substitution table. Verify: tests named after the scenarios 'A Japanese line decodes as its text' and 'Falcom's heart reads as a heart' written first and seen failing.

## 4. The installs

- [ ] 4.1 Add the dump command in `scripts`, and settle the open question of the thirteen raw monster tables from its output. Verify: run on the FC, SC and 3rd installs, every entry the rule marks compressed decodes, and the thirteen tables read as their raw bytes.
- [ ] 4.2 Run every image and scena reader over the three installs and complete the `._CH` format table and the opcode table from the failures. Verify: the dump reports no failed `._CH`, `._CP`, `._DS`, `._DA` or `._SN` entry and no `U+FFFD` in any script's text.
