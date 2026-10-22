# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.3.3](https://github.com/Esposter/Esposter/compare/v4.3.2...v4.3.3) (2026-10-22)

**Note:** Version bump only for package mjml-blocks

## [4.3.2](https://github.com/Esposter/Esposter/compare/v4.3.1...v4.3.2) (2026-10-21)

**Note:** Version bump only for package mjml-blocks

## [4.3.1](https://github.com/Esposter/Esposter/compare/v4.3.0...v4.3.1) (2026-10-21)

**Note:** Version bump only for package mjml-blocks

# [4.3.0](https://github.com/Esposter/Esposter/compare/v4.2.0...v4.3.0) (2026-10-21)

### Bug Fixes

* **mjml-blocks:** a refused tag is kept under its name in angle brackets, so it cannot overwrite a read prop ([f32a971](https://github.com/Esposter/Esposter/commit/f32a971fb8d375d7a8b8c641ef19f58e7048c923))
* **mjml-blocks:** a second body or head is refused by name, not merged ([2e748c9](https://github.com/Esposter/Esposter/commit/2e748c9a1f7336ca48783e28fd7ae1569bd1e3f2))
* **mjml-blocks:** a second document or text outside the mjml is refused, not dropped ([ef22fc7](https://github.com/Esposter/Esposter/commit/ef22fc7feee8cf54ddc401f2e9fa9788cfd46def))
* **mjml-blocks:** an attribute on the title is refused by name ([31b8fd3](https://github.com/Esposter/Esposter/commit/31b8fd38e75a8293e556a8990740fb785bde1186))
* **mjml-blocks:** an imported id attribute is refused at its node, not taken as the node's id ([a91a17a](https://github.com/Esposter/Esposter/commit/a91a17afa7c979d432dea3de7c37ca3978478dfe)), closes [#179](https://github.com/Esposter/Esposter/issues/179)
* **mjml-blocks:** every component's defaults sit under mj-all's own tag, so a tag named all is refused rather than read as them ([4191aa4](https://github.com/Esposter/Esposter/commit/4191aa46bf37473b324f6a33cc821615993bf44e))
* **mjml-blocks:** leave the id and children to the branch's own props ([737d078](https://github.com/Esposter/Esposter/commit/737d078457b8984f3d6d9eda4d302c7c9407c9e1))
* **mjml-blocks:** refuse a source attribute that would overwrite a node's own prop ([f7df34e](https://github.com/Esposter/Esposter/commit/f7df34e33e6dfbc704a34d078e7671a033f8707d))
* **mjml-blocks:** refuse the attributes the head, its defaults and a non-inline style would drop ([f3abd7d](https://github.com/Esposter/Esposter/commit/f3abd7dfff920ae1ccb88dfcb9d9b67510cad4a4))
* **mjml-blocks:** refuse the mj-style attributes it does not model ([c83f915](https://github.com/Esposter/Esposter/commit/c83f915c9f3efd5f9181a55bd4587cbb3028e257))
* **mjml-blocks:** stray text in the head or a container is refused by name, not dropped ([6a76809](https://github.com/Esposter/Esposter/commit/6a7680938f032986750df616734da7f96ef664ca))
* **mjml-blocks:** the colour and integer grammars match the whole value, and thumbnails-src is checked as an address ([b86d69f](https://github.com/Esposter/Esposter/commit/b86d69f59ce9e07baa0d7393328472c9340d14d9))
* **mjml-blocks:** the exported schema is annotated for isolated declarations, and the rows keep their tuple type ([fd19921](https://github.com/Esposter/Esposter/commit/fd199216bf7283ed41adfb52ee85ce28eec8f939))
* **mjml-blocks:** the label content schema is a shared constant, not a forwarding helper ([f7be540](https://github.com/Esposter/Esposter/commit/f7be540abba1b60ef8d3e3b0f8f24a76f8908534))
* **mjml-blocks:** the navbar's default icons are the characters they name, not their entities ([25e8822](https://github.com/Esposter/Esposter/commit/25e88223c34b5516e7bd359147dbd64367c7e593))
* **mjml-blocks:** the root's direction is a direction prop, and its dir attribute is one named constant ([59ea7ce](https://github.com/Esposter/Esposter/commit/59ea7ce97bf4db2b5d1a15c95f540302ff3e66e6))

### Features

* **headless-block-editor:** type each node's child slots and refuse nested children a slot does not accept ([908eca4](https://github.com/Esposter/Esposter/commit/908eca49e5c1286fc99f5eaf401c4976dc5b70d7))
* **mjml-blocks:** a consumer's leaf renders with the consumer's context, and an email's root props are typed by its registry ([adf91bb](https://github.com/Esposter/Esposter/commit/adf91bbbde86c62b1208562af41df45f38d27f8a))
* **mjml-blocks:** each component's content kind is paired with its content schema in one map ([073d0f4](https://github.com/Esposter/Esposter/commit/073d0f4c2260b5ac3a965d6fcf9b78da31ae2f3e))
* **mjml-blocks:** MJML source written and read back, and the plugin's in-scope issues pinned by tests ([7b93b26](https://github.com/Esposter/Esposter/commit/7b93b265d10eb5114aa29d3a77cd0250d2275ce1))
* **mjml-blocks:** MJML's component set as block types, with its attributes, defaults, nesting and cascade, rendered to its JSON form ([10f94de](https://github.com/Esposter/Esposter/commit/10f94dee9b540a404ea90532206c94988818eb98))
* **mjml-blocks:** scaffold the package MJML's components become block types in ([575fb16](https://github.com/Esposter/Esposter/commit/575fb1639a643dd9f4ea345147b40f43ecc69733))
