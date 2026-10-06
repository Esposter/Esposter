# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
