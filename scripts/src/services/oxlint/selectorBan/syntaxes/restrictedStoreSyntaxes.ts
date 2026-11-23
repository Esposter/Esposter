import type { SelectorBanList } from "#src/models/oxlint/selectorBan/SelectorBanList";

import { VUE_PACKAGES } from "#src/services/oxlint/selectorBan/constants";

// The counterpart to `pinia/no-store-to-refs-in-store`, and the one rule for every consumer of a store in the app: a
// Vue file, a composable, a service and a test alike. A store's own source is the exception, carved out by the
// Scope below, since its dot-read of a nested store's refs is deliberate: that binding has to stay live across a key
// Change. A store's own source keeps the method-call ban (`restrictedStoreCallSyntaxes.ts`).
// Destructuring is out of reach here: `const { rooms } = roomStore` and `const { createRoom } = roomStore` are the same
// Syntax, and which one loses reactivity depends on whether the name is a ref or a method — a question about the
// Store's type rather than about the shape on the page. The dot is the half decidable from syntax alone.
export const RESTRICTED_STORE_SYNTAXES: SelectorBanList = {
  bans: [
    {
      // Lower-camel only: a `FooStore` is a plain module object rather than a `use*Store()` handle
      message:
        "Destructure a store's methods and take its refs through `storeToRefs` — a consumer never reads a store by dot. See the pinia skill.",
      selector: "MemberExpression[object.name=/^[a-z][A-Za-z0-9]*Store$/]",
    },
  ],
  excludeFiles: ["**/*.d.ts", "**/test/setup.ts", "**/app/store/**/!(*.test|*.bench|*.test-d).ts"],
  files: [`${VUE_PACKAGES}/**/*.vue`, `${VUE_PACKAGES}/**/app/**/*.ts`],
  isTemplate: true,
};
