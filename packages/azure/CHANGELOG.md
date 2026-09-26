# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.4.0](https://github.com/Esposter/Esposter/compare/v3.3.0...v3.4.0) (2026-09-26)

**Note:** Version bump only for package @esposter/azure

# [3.3.0](https://github.com/Esposter/Esposter/compare/v3.2.0...v3.3.0) (2026-09-26)

### Bug Fixes

* **azure:** a calendar date no month holds deserializes to its string ([6e08d82](https://github.com/Esposter/Esposter/commit/6e08d82059db1c737a9f77874df4616d2dee64f5))
* **azure:** a date-shaped value that is not a date deserializes to its string ([5270ab5](https://github.com/Esposter/Esposter/commit/5270ab5b6ea6313697292b77e43165bfe6eb072b))
* **azure:** the clause pattern alternates with the regex's own bar, not the id separator ([0e4610c](https://github.com/Esposter/Esposter/commit/0e4610cd926fd200805ee083d550864bc95246e1))
* main passes lint, typecheck and coverage again ([f609e55](https://github.com/Esposter/Esposter/commit/f609e554c27d90d67b23b0f71b34ee00a1f9234a)), closes [#detail](https://github.com/Esposter/Esposter/issues/detail) [#title](https://github.com/Esposter/Esposter/issues/title)

# [3.2.0](https://github.com/Esposter/Esposter/compare/v3.0.0...v3.2.0) (2026-09-17)

### Bug Fixes

* **azure:** the rename into shared/ carries the import order with it ([2cc42a0](https://github.com/Esposter/Esposter/commit/2cc42a062960a06673f1426914078d69574d1bc1))
* **lint:** the type-import split keeps its import groups sorted, and two selectors stop over-matching ([3ed5095](https://github.com/Esposter/Esposter/commit/3ed50959bcda5f5469d77ccba8429fddce702eb0))
* snapshots ([23fe39b](https://github.com/Esposter/Esposter/commit/23fe39b5ea8f2076d4261736acd106eb50518dc7))

### Features

* **lint:** consistent-type-imports is on for .ts ([3a425e3](https://github.com/Esposter/Esposter/commit/3a425e330adbd87ae137d5c0ea3502e0d1425b04))

# [3.1.0](https://github.com/Esposter/Esposter/compare/v3.0.0...v3.1.0) (2026-09-17)

### Bug Fixes

* **azure:** the rename into shared/ carries the import order with it ([2cc42a0](https://github.com/Esposter/Esposter/commit/2cc42a062960a06673f1426914078d69574d1bc1))
* **lint:** the type-import split keeps its import groups sorted, and two selectors stop over-matching ([3ed5095](https://github.com/Esposter/Esposter/commit/3ed50959bcda5f5469d77ccba8429fddce702eb0))
* snapshots ([23fe39b](https://github.com/Esposter/Esposter/commit/23fe39b5ea8f2076d4261736acd106eb50518dc7))

### Features

* **lint:** consistent-type-imports is on for .ts ([3a425e3](https://github.com/Esposter/Esposter/commit/3a425e330adbd87ae137d5c0ea3502e0d1425b04))

# [3.0.0](https://github.com/Esposter/Esposter/compare/v2.40.0...v3.0.0) (2026-09-12)

**Note:** Version bump only for package @esposter/azure

# [2.40.0](https://github.com/Esposter/Esposter/compare/v2.39.0...v2.40.0) (2026-09-10)

**Note:** Version bump only for package @esposter/azure

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
