# Verifying Usage Examples

Read when a README's usage or Getting Started block is written or changed, or when the API it calls changes.

No check reads a README's code fences: no tsconfig includes them, and CI typechecks, lints and tests only the source. So an example is verified by hand, once, against the source it names, on the change that writes it or changes the API it calls. This is not the session check `running-checks` covers (the tests a change touched, or a CI red being reproduced); a fence belongs to no check, so it is checked where it is written.

## The compiler per example

- **`.ts`** — `tsrs --fast -p <config>`, the compiler the packages' `typecheck` script runs (`tsrs --fast`). It takes a tsc-style config, and `tsrs` cannot read `.vue`.
- **`.vue`** — `vue-tsc --noEmit -p <config>`, from `apps/web/node_modules/.bin/vue-tsc` (the catalog version). Four packages declare it, all as `catalog:` (`apps/web`, `genshin-interface`, `vue-phaserjs` and `genshin-world`), and `apps/web`'s own typecheck is `nuxt typecheck`, so this copy is for a README example only.
- The repo's TypeScript is 6: `baseUrl` is removed from the config, so map the package's name with `paths`.

## Steps

1. **Extract the block.** A `.ts` example goes in the session's scratchpad, outside the repo. A `.vue` example goes in a `.readme-check/` folder inside its package, because `vue` must resolve from that package's `node_modules`.
2. **Write the config.** Map the package's npm name to its source entry, `exports["."].source` in its `package.json`:

   ```json
   {
     "compilerOptions": {
       "lib": ["ESNext", "DOM", "DOM.Iterable"],
       "target": "ESNext",
       "module": "ESNext",
       "moduleResolution": "bundler",
       "noEmit": true,
       "strict": true,
       "skipLibCheck": true,
       "allowImportingTsExtensions": true,
       "types": [],
       "paths": { "<npm-name>": ["<absolute path to the source entry>"] }
     },
     "files": ["<example>.ts"]
   }
   ```

   A `.vue` config replaces `files` with `"include": ["./*.vue"]`. Write the paths as `C:/…`: `cygpath -m` converts a Git Bash path, and `tsrs` reads a `/c/…` path as relative.

3. **Run it.** A `.ts` example: from the package directory, `pnpm exec tsrs --fast -p <config>`. A `.vue` example: from the package directory, `../../apps/web/node_modules/.bin/vue-tsc --noEmit -p .readme-check/tsconfig.json`. A pass is exit 0; the `TNB ACTIVE` banner is not an error.
4. **Prove the checker can fail.** Add one line, `const planted: number = "x";`, to the copy, rerun, and expect a `TS2322` error with a non-zero exit. Remove the line after. A zero exit alone proves nothing, since a config that matches no file passes too.
5. **Remove the scratch.** Delete `.readme-check/` and the scratchpad files. `git status` must show no untracked file under the package.

## Traps seen

- A source built against a smaller `lib` fails inside its own code (`toSorted`, `withResolvers`, `fromBase64`) before the example is reached. Use the `lib` above, which is what the packages compile against.
- A `/c/…` path is read as relative, so the config fails with `TS6053: File … not found`.
- `baseUrl` fails with `TS5102`, since the repo's TypeScript removed it.
