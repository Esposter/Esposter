import type { ESTree, Plugin } from "@oxlint/plugins";

import { definePlugin, defineRule } from "@oxlint/plugins";
// Oxlint JS plugin enforcing the two decidable halves of the `trpc` skill, scoped in the root .oxlintrc.json to
// `packages/app/server/trpc/**` — `.query`/`.mutation` only mean a procedure there, and `TRPCError` is only
// Constructed there.
//
// Both rules exist to shrink the trpc ledger rather than to be swept forever: each was found by hand in two
// Consecutive sweep units, in the same shape, which is the signal that an enforcer should own it
// (`sweeps` skill, "Shrinking beats re-running").
//
// Neither needs type information. A missing generic is an absent `typeArguments`, and a hand-rolled error is an
// Object literal whose `message` reads `.message` off a `new *Error(...)` the repo already has a constructor for.
const GUARD_BY_ERROR = {
  ForbiddenError: "getForbiddenError",
  InvalidOperationError: "getInvalidOperationError",
  NotFoundError: "getNotFoundError",
} as const;
// A rejected mutation reads the same whether a guard caught it or the router asserted it, which is why the code
// And the message are paired in one constructor rather than at every throw site.
const getHandRolledMessage = (errorName: string, guardName: string): string =>
  `Hand-rolled TRPCError: \`${guardName}\` already pairs this code with \`${errorName}\`'s message. Throw \`${guardName}(...)\` instead — it takes the code as its last argument when it is not the default.`;

const MISSING_MESSAGE =
  "A BAD_REQUEST TRPCError always carries a message — a bare one reaches the client as an empty rejection. Use `getInvalidOperationError(operation, entityType, name)`, or pass a `message` naming the invalid value.";

const MISSING_RETURN_TYPE =
  "Procedure is missing its return-type generic. Write `.query<T>(...)` / `.mutation<T>(...)` — the generic pins a public API surface, so a handler that later grows a `return` is a compile error rather than a silently widened response. A procedure returning nothing writes `<void>`.";
// The `message:` property of an object literal, when it reads `.message` off a `new SomeError(...)`.
const getHandRolledErrorName = (property: ESTree.Node): string | undefined => {
  if (property.type !== "Property" || property.computed) return undefined;
  const { key, value } = property;
  if (key.type !== "Identifier" || key.name !== "message") return undefined;
  else if (value.type !== "MemberExpression" || value.computed) return undefined;
  else if (value.property.type !== "Identifier" || value.property.name !== "message") return undefined;
  const { object } = value;
  if (object.type !== "NewExpression" || object.callee.type !== "Identifier") return undefined;
  return object.callee.name;
};

const getIsBadRequestCode = (property: ESTree.Node): boolean => {
  if (property.type !== "Property" || property.computed) return false;
  const { key, value } = property;
  return key.type === "Identifier" && key.name === "code" && value.type === "Literal" && value.value === "BAD_REQUEST";
};

const noHandRolledError = defineRule({
  create(context) {
    return {
      NewExpression(node) {
        if (node.callee.type !== "Identifier" || node.callee.name !== "TRPCError") return;
        const [argument] = node.arguments;
        if (argument?.type !== "ObjectExpression") return;

        // An explicitly written message is hand-rolled wherever it sits — a spread earlier in the object cannot
        // Make `message: new NotFoundError(...).message` mean anything else
        for (const property of argument.properties) {
          const errorName = getHandRolledErrorName(property);
          if (errorName !== undefined && errorName in GUARD_BY_ERROR) {
            const guardName = GUARD_BY_ERROR[errorName as keyof typeof GUARD_BY_ERROR];
            context.report({ message: getHandRolledMessage(errorName, guardName), node });
            return;
          }
        }
        // Only the properties after the last spread are decidable: a later key overrides the spread, so a
        // `message` written past it is definitely present, while one written before it may be overridden and a
        // Spread with no `message` after it may still be supplying one
        const lastSpreadIndex = argument.properties.findLastIndex((property) => property.type === "SpreadElement");
        const decidableProperties = argument.properties.slice(lastSpreadIndex + 1);
        const hasMessage = decidableProperties.some(
          (property) =>
            property.type === "Property" &&
            !property.computed &&
            property.key.type === "Identifier" &&
            property.key.name === "message",
        );
        if (hasMessage) return;
        else if (lastSpreadIndex !== -1) return;
        // A bare BAD_REQUEST is the other half of the same convention: the code without the message the skill
        // Requires beside it
        if (argument.properties.some((property) => getIsBadRequestCode(property)))
          context.report({ message: MISSING_MESSAGE, node });
      },
    };
  },
  meta: { type: "problem" },
});

const requireReturnType = defineRule({
  create(context) {
    return {
      CallExpression(node) {
        const { callee, typeArguments } = node;
        if (typeArguments) return;
        else if (callee.type !== "MemberExpression" || callee.computed) return;
        else if (callee.property.type !== "Identifier") return;
        // `.subscription` is deliberately absent: an async generator carries its yield type as a callback
        // Annotation, which is the one place the skill's method-generic rule does not reach
        else if (callee.property.name !== "query" && callee.property.name !== "mutation") return;
        // Drizzle's `ctx.db.query` is a property, never a call, so a `.query(` here is always a procedure —
        // But a callee that is itself a bare identifier call (`query(...)`) is not a builder chain
        else if (callee.object.type === "Identifier" && callee.object.name === "db") return;

        context.report({ message: MISSING_RETURN_TYPE, node });
      },
    };
  },
  meta: { type: "suggestion" },
});

const plugin: Plugin = definePlugin({
  meta: { name: "trpc-procedure" },
  rules: { "no-hand-rolled-error": noHandRolledError, "require-return-type": requireReturnType },
});

export default plugin;
