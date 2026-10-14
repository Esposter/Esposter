# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.2.0](https://github.com/Esposter/Esposter/compare/v4.1.2...v4.2.0) (2026-10-14)

**Note:** Version bump only for package nuxt-security-module

## [4.1.2](https://github.com/Esposter/Esposter/compare/v4.1.1...v4.1.2) (2026-10-14)

**Note:** Version bump only for package nuxt-security-module

## [4.1.1](https://github.com/Esposter/Esposter/compare/v4.1.0...v4.1.1) (2026-10-14)

**Note:** Version bump only for package nuxt-security-module

# [4.1.0](https://github.com/Esposter/Esposter/compare/v4.0.0...v4.1.0) (2026-10-13)

### Bug Fixes

* **configuration:** a Nuxt module's entries leave out every non-source file the barrels do, so a benchmark fixture beside a runtime file is no export ([f93dbc2](https://github.com/Esposter/Esposter/commit/f93dbc21da3614dd15674f38caa4d36848abfb63))
* **nuxt-security-module:** a header set through the routeRules hook reaches the response ([87118e9](https://github.com/Esposter/Esposter/commit/87118e91739eb56b1538e36321b0b371cc249d7f))
* **nuxt-security-module:** a malformed Basic header answers 401 rather than 500, and the name and password are both always compared ([07fb14b](https://github.com/Esposter/Esposter/commit/07fb14bb92689aa55cada7713d0af0e78940c68d))
* **nuxt-security-module:** an option error names the deepest path that failed, walking every union branch, so an undefined CSP source reports headers.contentSecurityPolicy.img-src.<index> instead of headers ([a40fcb6](https://github.com/Esposter/Esposter/commit/a40fcb655088f88c3fa424cbfc0bab7337148e99))
* **nuxt-security-module:** every exported schema annotated with its type, and ModuleOptions sorted ([3d3d564](https://github.com/Esposter/Esposter/commit/3d3d5646c62c994c933ab73ab846d5da19f6da3d))
* **nuxt-security-module:** module.ts loads natively without an enum, so Nuxt stops falling back to jiti ([6d0f07e](https://github.com/Esposter/Esposter/commit/6d0f07e2b193ea8ebd4c0c15cb52a25845609c81))
* **nuxt-security-module:** package.json exports list the page.fixture entry tsdown regenerates ([bbd309a](https://github.com/Esposter/Esposter/commit/bbd309ab6d7b85d45953dee9c064c3c3ff11bab7))
* **nuxt-security-module:** subresource integrity hashes every file under a public asset, nested ones included ([80f04d1](https://github.com/Esposter/Esposter/commit/80f04d1d0326528bf30b11f49bd184e4b7b220d2))
* **nuxt-security-module:** the CORS middleware's wildcard branch removed, as the schema refuses it ([aa82375](https://github.com/Esposter/Esposter/commit/aa82375d7b845d450b6bc539860c30dab8683115))
* **nuxt-security-module:** the exported schemas annotate their concrete zod shape and keep satisfies, as isolatedDeclarations needs ([d083e4b](https://github.com/Esposter/Esposter/commit/d083e4b1ea6dbb865946c41933b14067b0903911))
* **nuxt-security-module:** the h3 devDependency is dropped, since the package imports h3 through nitro/h3 ([302c35b](https://github.com/Esposter/Esposter/commit/302c35b855fe2ba1bb2ec926a101bc13ad0d2a88))
* **nuxt-security-module:** the h3 devDependency returns, so the route-rule augmentation of h3/rules resolves, and the route rules are typed by RouteRuleConfig ([f643718](https://github.com/Esposter/Esposter/commit/f643718724cb3ab7cc40c9254d2da0153f605e97))
* **nuxt-security-module:** the lint repairs, the verdict an enum in its own model, the bench's serial hooks and middlewares named with the reason they stay in order, and the continuation comments capitalized ([08a2d57](https://github.com/Esposter/Esposter/commit/08a2d57e014b19fe6f4218fc6a199b5ec89d0168))
* **nuxt-security-module:** the Nuxt runtime config is written only when basic auth is configured, so its generated type keeps the options' shape ([7ce1d37](https://github.com/Esposter/Esposter/commit/7ce1d37fdefc9c300855d2ad96855de65b0e8ffb))
* **nuxt-security-module:** the package carries lerna's one version, and the workspace suite holds every member to it ([3185bbe](https://github.com/Esposter/Esposter/commit/3185bbec90c529e963d29dac71050b4b970d5cbd))
* **nuxt-security-module:** the package declares no bench script, since it has no benchmark yet ([f7f68f3](https://github.com/Esposter/Esposter/commit/f7f68f3764a243d1363ea7c4f08e81b22b6c8cdd))
* **nuxt-security-module:** the package manifest is valid JSON again, with the rate limiter's export and publish row ([5af69d5](https://github.com/Esposter/Esposter/commit/5af69d5d0b4312d66ef58daa430e8c4f6c737f8d))
* **nuxt-security-module:** the package passes lint — the eslint autofixes, a check* name for the boolean-returning CSP guard, and Zod's type namespace import ([7d29544](https://github.com/Esposter/Esposter/commit/7d29544b06143d994ec74e5c79819d244ba214b7))
* **nuxt-security-module:** the page benches time an enabled route ([e78628c](https://github.com/Esposter/Esposter/commit/e78628c6c10d5be6dd6dc2b731ad7e13e0f1033d))
* **nuxt-security-module:** the rate limiter middleware is in the package exports the build regenerates, so the build's dirty-tree check passes ([66aa6d6](https://github.com/Esposter/Esposter/commit/66aa6d6aacfeddbdb953b5509967cb17f4ed1a5c))
* **nuxt-security-module:** the rate limiter's comment says a forwarded address is never read, as the middleware does ([bff0f9f](https://github.com/Esposter/Esposter/commit/bff0f9f57b8e0e1c2263dddd9e6a3176d962b673))
* **nuxt-security-module:** the rate limiter's schema and its tests are tracked, so the module schema accepts the option its defaults set ([c464926](https://github.com/Esposter/Esposter/commit/c464926eb2328a006ea68371fb79da81ae6befb8))
* **nuxt-security-module:** the route rules plugin and the benches' comparisons are awaited ([f3663db](https://github.com/Esposter/Esposter/commit/f3663dbaeb8b2a19f7fa018185b763f0e3f4fe64))
* **nuxt-security-module:** the route rules' security key merges into a consumer's routeRules type, augmenting h3/rules where RouteRuleConfig is declared ([d1cb8cd](https://github.com/Esposter/Esposter/commit/d1cb8cd6494f43877594e41849b544e918d78d7f))
* **nuxt-security-module:** Zod is imported as the z named binding, and the lint comments and the type test's import pass the linter ([1893406](https://github.com/Esposter/Esposter/commit/189340665625dab1d48de0c875a58a238d077b53))
* the review fixers' oxlint reds across thirty files ([c941591](https://github.com/Esposter/Esposter/commit/c94159170bc330a6b884c34bff6d06b50db06246))
* vitest returns to the root and the app, vue-tsc to the app, and the release script returns, with the lockfile refreshed ([7487b02](https://github.com/Esposter/Esposter/commit/7487b02f3d2ab52795c969af78c67f5ea0b013a2))

### Features

* **nuxt-security-module:** an in-memory rate limiter behind a store interface, keyed on the connection's address, with a bounded key count ([499d64d](https://github.com/Esposter/Esposter/commit/499d64d744c7f672088ed31594506d33fc9fbd5d))
* **nuxt-security-module:** CORS, allowed methods, basic auth with a constant-time compare and a validated config read, and the request size limit ([2acec72](https://github.com/Esposter/Esposter/commit/2acec722dffe72bd6d257ed4ba765875c7cd2051))
* **nuxt-security-module:** CSRF by the double submit cookie, the route rules' security key checked at build, and strict mode's stricter script policy ([e0b396b](https://github.com/Esposter/Esposter/commit/e0b396b046dab1bdc4693df14a97e255278b39e8))
* **nuxt-security-module:** module options are validated by one Zod schema per option group, and a bad option fails the build with its path ([de157a4](https://github.com/Esposter/Esposter/commit/de157a4b48ab28a60ca2ac3bc892c9c3f4a60bd6))
* **nuxt-security-module:** removeLoggers sets the bundler's dropConsole, which drops the console calls on the AST rather than by regex ([d04258f](https://github.com/Esposter/Esposter/commit/d04258fdf508b40e969237ee29e72de1c81fb9ec))
* **nuxt-security-module:** security header serialisation, the nonce and integrity rewriting that keeps markup attributes intact, and the SSG hash collection ([456840a](https://github.com/Esposter/Esposter/commit/456840a9149361304c033ea330f3b9e632031865))
* **nuxt-security-module:** the module page's option parity table gives every upstream 2.6.0 option one verdict, and a test fails when an upstream option is missing or named twice ([781d71f](https://github.com/Esposter/Esposter/commit/781d71f20fdbe4be362cda1cd1772557866fc892))
* **nuxt-security-module:** the Nitro plugins that set the headers, write the nonce and integrity, hash the prerender policy and hide the powered-by header ([d88712a](https://github.com/Esposter/Esposter/commit/d88712a5b99dc9e113269068244dbd68f7b17156))
* **nuxt-security-module:** the package scaffold, its module entry, options, models, route rules and build-time services ([08f11c8](https://github.com/Esposter/Esposter/commit/08f11c8ff89b3a885bd4c8f96fe5e88f97efe942))
* **scripts:** pnpm ai:ci:watch waits for the CI run covering ai/queue's tip and prints each failed job's error lines ([9da46e7](https://github.com/Esposter/Esposter/commit/9da46e7a0e52b76cea21ae07a66beee46fff1b60))
