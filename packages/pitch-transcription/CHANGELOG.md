# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.4.0](https://github.com/Esposter/Esposter/compare/v4.3.3...v4.4.0) (2026-10-30)

### Bug Fixes

* **pitch-transcription:** the writeMidi and note exports carry the explicit types isolated declarations need ([28c1031](https://github.com/Esposter/Esposter/commit/28c1031d9192804e0ede2b9fc9e48e25ad58d156))

## [4.3.3](https://github.com/Esposter/Esposter/compare/v4.3.2...v4.3.3) (2026-10-22)

**Note:** Version bump only for package pitch-transcription

## [4.3.2](https://github.com/Esposter/Esposter/compare/v4.3.1...v4.3.2) (2026-10-21)

**Note:** Version bump only for package pitch-transcription

## [4.3.1](https://github.com/Esposter/Esposter/compare/v4.3.0...v4.3.1) (2026-10-21)

**Note:** Version bump only for package pitch-transcription

# [4.3.0](https://github.com/Esposter/Esposter/compare/v4.2.0...v4.3.0) (2026-10-21)

### Bug Fixes

* **ci:** resolve workspace lint and typecheck failures ([7a226bb](https://github.com/Esposter/Esposter/commit/7a226bb0be7d0a908b9ef8611a99243ce35d85fe))
* **packages:** the absorbed packages typecheck and lint clean ([7483a70](https://github.com/Esposter/Esposter/commit/7483a70c65b614ed0a8c43f2e3180215c9c246e2))
* **pitch-transcription:** a note's velocity is clamped to 1..127, so a quiet note still sounds and a loud one is not a status byte ([46bceaf](https://github.com/Esposter/Esposter/commit/46bceaf4e2fdf86f299c2078a00bd679aafc1312)), closes [#174](https://github.com/Esposter/Esposter/issues/174)
* **pitch-transcription:** each read test runs its own read, and the README says a runtime takes another copy's tensors ([7630f23](https://github.com/Esposter/Esposter/commit/7630f23c7f35e8becd81fb07a839fbaebf1b8a5a))
* **workspace:** a required peer is listed once, and a test holds every manifest to it ([8823f95](https://github.com/Esposter/Esposter/commit/8823f95e44a66baaafc7684fb1a277b85c759e17))

# [4.2.0](https://github.com/Esposter/Esposter/compare/v4.1.2...v4.2.0) (2026-10-14)

**Note:** Version bump only for package pitch-transcription

## [4.1.2](https://github.com/Esposter/Esposter/compare/v4.1.1...v4.1.2) (2026-10-14)

**Note:** Version bump only for package pitch-transcription

## [4.1.1](https://github.com/Esposter/Esposter/compare/v4.1.0...v4.1.1) (2026-10-14)

**Note:** Version bump only for package pitch-transcription

# [4.1.0](https://github.com/Esposter/Esposter/compare/v4.0.0...v4.1.0) (2026-10-13)

### Features

* **pitch-transcription:** the MIDI file is written by the package itself, and @tonejs/midi is removed ([bd23e89](https://github.com/Esposter/Esposter/commit/bd23e89441f7a655191cb3adf2546cfac3386e07))

# [4.0.0](https://github.com/Esposter/Esposter/compare/v3.9.0...v4.0.0) (2026-10-06)

### Bug Fixes

* **eslint:** a boolean-returning callback parameter is check*, as a declarator already was ([cd14c47](https://github.com/Esposter/Esposter/commit/cd14c472b2e675a55fbc6c0f018e450fc5e83957))
* **oxlint:** an in-place sort is an error in statement form too, and its four sites sort into a copy ([519e076](https://github.com/Esposter/Esposter/commit/519e0769e0f3ea3968e6786473e03b0be67e9fda))
* **pitch-transcription:** lint findings ([84268e3](https://github.com/Esposter/Esposter/commit/84268e3809b63913f534f855e59abb070e8b88bb))
* **pitch-transcription:** load under plain Node ([4b67b05](https://github.com/Esposter/Esposter/commit/4b67b050d151e555d396cef7d87fa5ecbcf9a530))
* **pitch-transcription:** the plain-Node load check logs a string, never a coloured boolean ([b7d6c6a](https://github.com/Esposter/Esposter/commit/b7d6c6ab1fc9edb1b6e1d29c994e04898c2d10f2))
* repair main's red checks after the genshin-mods and pitch-transcription landings ([f04257b](https://github.com/Esposter/Esposter/commit/f04257b69d566fb28a8011217156c8895eebdc81))

### Features

* **pitch-transcription:** absorb basic-pitch on current TensorFlow.js ([cf83e26](https://github.com/Esposter/Esposter/commit/cf83e267aa157cb8df2e0cd333e37c5ef685ea16)), closes [#9](https://github.com/Esposter/Esposter/issues/9) [#17](https://github.com/Esposter/Esposter/issues/17) [#19](https://github.com/Esposter/Esposter/issues/19)

### Performance Improvements

* **pitch-transcription:** bench note creation at two lengths ([85397d6](https://github.com/Esposter/Esposter/commit/85397d6e6e984ab241595cc5274b8cd019061908))
* **pitch-transcription:** note creation copies no readings without a range and walks its cells by index ([5ff0c22](https://github.com/Esposter/Esposter/commit/5ff0c22b40913e8a1d934a5717079fe09cef45de))
