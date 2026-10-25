# A published bin wrapper

Read when a package publishes a `bin`: the wrapper file, the `bin` field that points at it, and the shebang that lets a global install run it.

- **A published `bin` wrapper carries `#!/usr/bin/env node`.** npm links the file itself on Unix and runs it through its shebang, so the line is what makes a global install work; pnpm's own shim calls `node` and would run without it. The `bin` field points at a committed one-line `bin/*.js` that imports the built entry, never at `dist`, which is gitignored: a fresh clone would install with no shim. The wrapper does not guard its import, because Node's own `ERR_MODULE_NOT_FOUND` already names the missing file. The built entry (`src/cli.ts` → `dist/cli.js`) carries no shebang, since the wrapper is the only file a shell executes.
