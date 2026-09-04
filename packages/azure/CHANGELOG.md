# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.39.0](https://github.com/Esposter/Esposter/compare/v2.38.1...v2.39.0) (2026-09-04)

### Bug Fixes

* **build:** only the barrels ctix writes are excluded from the fingerprint ([1770e1d](https://github.com/Esposter/Esposter/commit/1770e1d4a1857c30dd687a41d32a83b77e5c163c))
* **ci:** unbreak the function deploy pnpm 12 broke, and pin the rule ([6c874d2](https://github.com/Esposter/Esposter/commit/6c874d274abeab8072e782838c709f9db86bff7f))
* **use-mutation:** superseding a key drops its joinable read too ([385ed67](https://github.com/Esposter/Esposter/commit/385ed67910687a9155dfbbf20a0a702f33cbee28))

### Performance Improvements

* **platform:** the build generates its own barrel, and skips it when it can ([696835c](https://github.com/Esposter/Esposter/commit/696835c457837d8737b8cd09b940dc97577cfc24))

## [2.38.1](https://github.com/Esposter/Esposter/compare/v2.38.0...v2.38.1) (2026-08-23)

### Bug Fixes

* **build:** export source under a condition, so Node still resolves the build ([42fb8d4](https://github.com/Esposter/Esposter/commit/42fb8d471a8917cc53d9b105fddfc481fc58ddaf))
