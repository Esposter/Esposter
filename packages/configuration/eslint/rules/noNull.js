/**
 * Steers app-owned code toward `undefined` as the single absent-value sentinel by flagging `null` — both
 * the type-position `| null` (TSNullKeyword) and the `null` literal. `null` is only permitted at the
 * Drizzle ORM / Azure SDK boundary, where the external system owns the type; convert with `nullToUndefined`
 * from `@esposter/shared` on ingress. See content/docs/proposals/refactors/null-removal.md.
 *
 * Implemented as a dedicated rule rather than a `no-restricted-syntax` entry because the existing
 * `no-restricted-syntax` runs at `error`, and a single rule cannot carry two severities — this gate needs
 * `warn` so the pre-existing violations surface without blocking CI.
 */
export default {
  create(context) {
    const report = (node) => {
      context.report({ messageId: "noNull", node });
    };
    return {
      "Literal[raw='null']": report,
      TSNullKeyword: report,
    };
  },
  meta: {
    docs: {
      description: "Disallow `null` in favour of `undefined` outside the Drizzle/Azure boundary.",
    },
    messages: {
      noNull:
        "Use `undefined` instead of `null`. `null` is only allowed at the Drizzle/Azure boundary — convert with `nullToUndefined` from `@esposter/shared` on ingress. See content/docs/proposals/refactors/null-removal.md.",
    },
    schema: [],
    type: "suggestion",
  },
};
