# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.4.0](https://github.com/Esposter/Esposter/compare/v4.3.3...v4.4.0) (2026-10-30)

### Bug Fixes

* **ci:** the perfectionist sort fixes CI's Lint job failed on, in four packages ([b6c2e75](https://github.com/Esposter/Esposter/commit/b6c2e75a2aadc22847ec3d6946d0dabc7162a6e1))
* **lint:** the oxlint autofix gives void-returning arrows block bodies, and the formatter lays them out ([9103811](https://github.com/Esposter/Esposter/commit/910381177c6a9906b3283661d4f85ec66c77c785))
* **math-expression-compiler:** the named and decimal-mark delimiter sets are sorted as perfectionist/sort-sets wants ([b6e3051](https://github.com/Esposter/Esposter/commit/b6e30519bd3cfd1ec282bf3bcff0894feade0b69))

## [4.3.3](https://github.com/Esposter/Esposter/compare/v4.3.2...v4.3.3) (2026-10-22)

**Note:** Version bump only for package math-expression-compiler

## [4.3.2](https://github.com/Esposter/Esposter/compare/v4.3.1...v4.3.2) (2026-10-21)

**Note:** Version bump only for package math-expression-compiler

## [4.3.1](https://github.com/Esposter/Esposter/compare/v4.3.0...v4.3.1) (2026-10-21)

**Note:** Version bump only for package math-expression-compiler

# [4.3.0](https://github.com/Esposter/Esposter/compare/v4.2.0...v4.3.0) (2026-10-21)

### Bug Fixes

* **math-expression-compiler:** a call's errors point at the function's name, as the other parse errors point at their token ([ab3a665](https://github.com/Esposter/Esposter/commit/ab3a665f2d30f0da6972fe2c502a41f0fb33ddb4))
* **math-expression-compiler:** a decimal point after an exponent marker or its digits is an error, as mathjs reports it ([08a6ba8](https://github.com/Esposter/Esposter/commit/08a6ba85df82fd2d1abe9534fd17ce5c139cebf1))
* **math-expression-compiler:** a division or a percent sign before a group decides by its next tokens, so nested groups parse once rather than once per level ([b93db8d](https://github.com/Esposter/Esposter/commit/b93db8db2334dff5b8fc526ea32cd9b6e0ebafc3))
* **math-expression-compiler:** a function reads a list argument, and a list inside a list is refused ([9ae142a](https://github.com/Esposter/Esposter/commit/9ae142a1fd0edff2360de5f744ca417ab43010b5))
* **math-expression-compiler:** a function takes its arguments as one array, and max, min, hypot and the infinity norms fold as mathjs's do ([b86199b](https://github.com/Esposter/Esposter/commit/b86199b13c4502f3fbdda11ba6d41785894b4bd0))
* **math-expression-compiler:** a literal too large for its word size is an error, as mathjs refuses it ([5769f2a](https://github.com/Esposter/Esposter/commit/5769f2a8ef901e617d8c1e41d0e2e6681e7bde6f))
* **math-expression-compiler:** a name assigned past a chained comparison's first pair stays free ([37fa4e3](https://github.com/Esposter/Esposter/commit/37fa4e3020865f87e6313df0e28de0e9801f3941))
* **math-expression-compiler:** a name read before any assignment to it is a free name, as mathjs needs it to be a column ([b9f7b71](https://github.com/Esposter/Esposter/commit/b9f7b7111b38447563befb4d9e12e90769876e03))
* **math-expression-compiler:** a non-breaking space separates operands as a space does ([dcdd5db](https://github.com/Esposter/Esposter/commit/dcdd5db658513e59061cd3af17bbc5fa7d672c36))
* **math-expression-compiler:** a rounding of a large number keeps it, and rounding computes through its scalar forms ([589e215](https://github.com/Esposter/Esposter/commit/589e215a63c0797b5c4bf52df9aa225c10d2b816))
* **math-expression-compiler:** a token check reads the state's own string, so TypeScript's stale narrowing no longer rejects it ([18be4d4](https://github.com/Esposter/Esposter/commit/18be4d454a89901318818c11c459da00989a039a)), closes [microsoft/TypeScript#9998](https://github.com/microsoft/TypeScript/issues/9998)
* **math-expression-compiler:** an arity message says one argument in the singular ([4696772](https://github.com/Esposter/Esposter/commit/46967726ac9ebf141cede7e459e8636866fc8ae6))
* **math-expression-compiler:** an integer factorial is mathjs's binary-split product, so its last bits match ([d45a211](https://github.com/Esposter/Esposter/commit/d45a211c0e979e8549110865fcfb7c8c15e95e77))
* **math-expression-compiler:** and and xor take one operand as or does, and the right side of a nullish is no free name ([8e53f99](https://github.com/Esposter/Esposter/commit/8e53f994f4b0f5ae35fed639b6efc5cacb605909))
* **math-expression-compiler:** bernoulli takes its closed form from the index where zeta is one, and the function round's review leaves no forwarding closure ([e60edc1](https://github.com/Esposter/Esposter/commit/e60edc1b2497f6d816ffc56a0bd3dfd761818c23))
* **math-expression-compiler:** compare and compareNatural put an unordered operand before a number, as mathjs does ([6edb003](https://github.com/Esposter/Esposter/commit/6edb00312a2dd3cb9b5921ab4c9579de0ba66249))
* **math-expression-compiler:** isPrime is false above the safe integers, where every number is even, as mathjs answers it ([d702ddb](https://github.com/Esposter/Esposter/commit/d702ddbc0e8b46f9e7da3203a0a0d873292df097))
* **math-expression-compiler:** mod, invmod, bernoulli, sum, zeta and variance answer as mathjs does where they had drifted ([13ec38e](https://github.com/Esposter/Esposter/commit/13ec38eb0bc58c251d40831a51e677b0baf62b0f))
* **math-expression-compiler:** multiply folds a mix of numbers and lists, and det of the empty list is one, as mathjs answers ([c82c8f5](https://github.com/Esposter/Esposter/commit/c82c8f5f9c2b1b7d45495cd37b0571f36798630b))
* **math-expression-compiler:** stirlingS2 answers its closed cases directly and bounds the loop it runs ([947bde5](https://github.com/Esposter/Esposter/commit/947bde50a9129de71d1a9481dc91b41a0df6392b))
* **math-expression-compiler:** stirlingS2 reads the narrower band of a large count, where the cap was an error past 2000 ([055552a](https://github.com/Esposter/Esposter/commit/055552a6bdba1ba49fbc5b44f9f9db53c68262e1))
* **math-expression-compiler:** take the exact residue of two integers, and the zeta at the gamma's boundary ([a8f68e6](https://github.com/Esposter/Esposter/commit/a8f68e6dc01182bc30ab8976d2358df88a7a9e24))
* **math-expression-compiler:** the benches' sum helper is a fixture, and the operator chain reuses the ones generator ([69562da](https://github.com/Esposter/Esposter/commit/69562da217c65165a4c9bf07ee629c38bf4efdb4))
* **math-expression-compiler:** the parity suite's mismatch helper stops shadowing the snapshot's entries ([87ac7c6](https://github.com/Esposter/Esposter/commit/87ac7c665cd9fb317de5aadf6862f4e3a4830c65))
* the lint errors, the math test's parse cost and the tree-read timeouts ([1128416](https://github.com/Esposter/Esposter/commit/1128416ea43b6f26793d7b72778700f836e73a00))

### Performance Improvements

* **math-expression-compiler:** a left-associative level parses its operand by rule, rather than allocating a callback per operand ([33c2b5d](https://github.com/Esposter/Esposter/commit/33c2b5dcf58a3a1c64bfd30b3aa32dbeb2a5f7ba))
* **math-expression-compiler:** an operator and a call of one or two numbers compute through their function's scalar form, with no array per evaluation ([ab48faa](https://github.com/Esposter/Esposter/commit/ab48faaff0124757929e7cab4450ce24243d1594))
* **math-expression-compiler:** climb the binary operators and tokenize by character code ([72cb46c](https://github.com/Esposter/Esposter/commit/72cb46cd9c7e28299e2599a07f03ae2da0397b47))
