# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.30.0](https://github.com/Esposter/Esposter/compare/v2.29.0...v2.30.0) (2026-06-24)

### Bug Fixes

* emit oxfmt-aligned bench tables and guard empty bench samples ([640154c](https://github.com/Esposter/Esposter/commit/640154c2fba53330bb82259f40d9696c177112d1))
* explicit ZodObject annotations for isolated-declaration schemas; self-contained sandbox-runtime bundle ([7bf39bc](https://github.com/Esposter/Esposter/commit/7bf39bcb60235cef870fc1dab9abba66fe313390))
* lint ([d3f4f0c](https://github.com/Esposter/Esposter/commit/d3f4f0c40fb00cea162eef682eb35a113564eebe))
* reject empty file token in node <file> parse ([5f62563](https://github.com/Esposter/Esposter/commit/5f6256330068f3489cc24bb4e97e4c298e36c914))
* remove unnecessary casts ([656366d](https://github.com/Esposter/Esposter/commit/656366d3919b788661541e37f5f94e9e8f7ec76e))
* sandbox-runtime cleanup leaks + fair bench baseline ([24cc456](https://github.com/Esposter/Esposter/commit/24cc456cbb3649a9d836833554b107bb97a848fc))
* sandbox-runtime vfs test lint + try-ban compliance ([4b7f60e](https://github.com/Esposter/Esposter/commit/4b7f60e400f0a1d6210e503bb592872fb4f826f3))
* signal-aware exit codes + argv/shell-false hardening in sandbox exec ([ae71dae](https://github.com/Esposter/Esposter/commit/ae71daee733ade73305d2fcd23cf408601f50a0b))
* snapshot ([5a063b6](https://github.com/Esposter/Esposter/commit/5a063b683bb11f3de926924ba16c363095728401))
* snapshot ([b092c49](https://github.com/Esposter/Esposter/commit/b092c49c84b6da9a36149cbc6b2ff8cc54e59021))
* wip ([b0aa40f](https://github.com/Esposter/Esposter/commit/b0aa40fc4865554a7ed6f3cb6b172409dcc0bfc8))

### Features

* Add network and overlay dirs support ([060042f](https://github.com/Esposter/Esposter/commit/060042f229c13001e23b5eb93a94c93fef089794))
* root recursive bench script + vs-base multiplier in bench report ([ebb4afe](https://github.com/Esposter/Esposter/commit/ebb4afe18df064792017dffce39e0910082ebd08))
* sandbox-runtime bench foundation (committed results + metadata), defer CI gate ([ee9689b](https://github.com/Esposter/Esposter/commit/ee9689b138130850d879ffbf25f4f78d64d57266))
* sandbox-runtime MVP — ExecBackend seam, native backend, CLI, gate harnesses ([4a98e6d](https://github.com/Esposter/Esposter/commit/4a98e6dc8f75fe697ef31a55bc366d764a247a5d))
* sandbox-runtime os backend MVP (bwrap RAM-overlay exec, Linux core) ([8741186](https://github.com/Esposter/Esposter/commit/8741186212042fcb03ba962b88eb438a6d875843))
* sandbox-runtime source loaders + package lint/error wiring ([1db61d0](https://github.com/Esposter/Esposter/commit/1db61d0c8a6b97754ff7fceeb283e8eaffa700dd))
* sandbox-runtime vfs FS layer (@platformatic/vfs adapter + swap shim) ([5e78d33](https://github.com/Esposter/Esposter/commit/5e78d337a8a5b8f235e64ce732f3e05ca90f9f49))
* sandbox-runtime vfs in-process exec backend (Step B1) ([f7b0fa5](https://github.com/Esposter/Esposter/commit/f7b0fa5bb77cf7b82c18edf9e565119321228527))
* sandbox-runtime vfs Step B2 — overlay mount + node <file> (both gates) ([8fa5cb2](https://github.com/Esposter/Esposter/commit/8fa5cb21e1ba242b2d67c5108b7ff323967320f6))
* shared-node bench reporter + migrate benches to vitest bench ([0e39cf7](https://github.com/Esposter/Esposter/commit/0e39cf713eea30d36d50879ba4d56a6bf00fe73e))
