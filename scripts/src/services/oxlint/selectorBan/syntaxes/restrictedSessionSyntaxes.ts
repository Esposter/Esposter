import type { SelectorBanList } from "#src/models/oxlint/selectorBan/SelectorBanList";

import { TEST_FILE_PATTERNS, VUE_PACKAGES } from "#src/services/oxlint/selectorBan/constants";

// better-auth's synchronous `useSession()` is an atom that starts empty on the server, which has no cookie to read it
// With, and fills on the client before hydration ends, so anything it gates renders differently on the two sides. The
// Session is read from the payload instead: awaited through `useAuthSession`, or synchronously through
// `useSessionData`. The call that hands `useSession` a fetcher is `useAuthSession` itself, so only the bare call is banned
export const RESTRICTED_SESSION_SYNTAXES: SelectorBanList = {
  bans: [
    {
      message:
        "Don't read the session with `authClient.useSession()`: it is empty on the server and filled on the client, so what it gates mismatches on hydration. Use `useSessionData()`, or `await useAuthSession()`. See openspec/specs/architecture/hydration/design.md.",
      selector: "CallExpression[callee.property.name='useSession'][arguments.length=0]",
    },
  ],
  excludeFiles: [...TEST_FILE_PATTERNS, "**/*.d.ts"],
  files: [`${VUE_PACKAGES}/**/app/**/*.vue`, `${VUE_PACKAGES}/**/app/**/*.ts`],
};
