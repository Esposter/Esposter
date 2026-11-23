import { setupSelectorBanSuite } from "#src/services/oxlint/selectorBan/setupSelectorBanSuite.test";
import { RESTRICTED_SYNTAXES } from "#src/services/oxlint/selectorBan/syntaxes/restrictedSyntaxes";
import { describe } from "vitest";

describe("restrictedSyntaxes", () => {
  setupSelectorBanSuite({
    entries: RESTRICTED_SYNTAXES.bans,
    fixtures: [
      {
        filePath: "arrayMethodReference.ts",
        name: "arrayMethodReference",
        source: "const doubled = [1].map(double);",
        violations: 1,
      },
      {
        filePath: "arrayMethodWrapped.ts",
        name: "arrayMethodWrapped",
        source: "const doubled = [1].map((item) => double(item));",
        violations: 0,
      },
      {
        filePath: "arrayMethodCoercion.ts",
        name: "arrayMethodCoercion",
        source: "const numbers = ['1'].map(Number);",
        violations: 0,
      },
      {
        filePath: "arrayMethodNameElsewhere.ts",
        name: "arrayMethodNameElsewhere",
        source: "recorder.reduce(buffer, partialBuffer, count);",
        violations: 0,
      },
      {
        filePath: "arrayReduceReference.ts",
        name: "arrayReduceReference",
        source: "const total = [1].reduce(add, 0);",
        violations: 1,
      },
      {
        filePath: "localEscapeRegExp.ts",
        name: "localEscapeRegExp",
        source: "const escapeRegExp = (value: string) => RegExp(value);",
        violations: 1,
      },
      { filePath: "serverCountStep.ts", name: "serverCountStep", source: "post.likeCount++;", violations: 1 },
      {
        filePath: "serverCountSetFromSum.ts",
        name: "serverCountSetFromSum",
        source: "post.likeCount = post.likeCount + 1;",
        violations: 1,
      },
      {
        filePath: "serverRoleCountStep.ts",
        name: "serverRoleCountStep",
        source: "roles.countsByTopRole[0].count++;",
        violations: 1,
      },
      {
        filePath: "serverCountSetFromRead.ts",
        name: "serverCountSetFromRead",
        source: "post.likeCount = count;",
        violations: 0,
      },
      {
        filePath: "regexpEscape.ts",
        name: "regexpEscape",
        source: "const pattern = new RegExp(RegExp.escape(value), 'u');",
        violations: 0,
      },
      {
        filePath: "nativeAutofocus.vue",
        name: "nativeAutofocus",
        source: "<template>\n  <input autofocus />\n</template>",
        violations: 1,
      },
      {
        filePath: "componentAutofocus.vue",
        name: "componentAutofocus",
        source: '<template>\n  <UiButton :autofocus="true" />\n</template>',
        violations: 1,
      },
      {
        filePath: "libraryAutofocus.vue",
        name: "libraryAutofocus",
        source: "<template>\n  <UiTextField is-autofocus />\n</template>",
        violations: 0,
      },
      {
        filePath: "editorAutofocus.ts",
        name: "editorAutofocus",
        source: "useEditor({ autofocus: 'end' });",
        violations: 1,
      },
      {
        filePath: "updateProcedureUpserts.ts",
        name: "updateProcedureUpserts",
        source:
          "const router = { updateSettings: procedure.mutation(({ ctx, input }) => ctx.db.insert(settings).values(input).onConflictDoUpdate({ set: input, target: settings.userId })) };",
        violations: 1,
      },
      {
        filePath: "upsertProcedureUpserts.ts",
        name: "upsertProcedureUpserts",
        source:
          "const router = { upsertSettings: procedure.mutation(({ ctx, input }) => ctx.db.insert(settings).values(input).onConflictDoUpdate({ set: input, target: settings.userId })) };",
        violations: 0,
      },
      {
        filePath: "computedDateNow.ts",
        name: "computedDateNow",
        source: "const isPast = computed(() => event.start.getTime() < Date.now());",
        violations: 1,
      },
      {
        filePath: "computedNewDate.ts",
        name: "computedNewDate",
        source: "const isExpired = computed(() => expiresAt > new Date());",
        violations: 1,
      },
      {
        filePath: "dateNowOutsideComputed.ts",
        name: "dateNowOutsideComputed",
        source: "const startedAt = Date.now();",
        violations: 0,
      },
      { filePath: "blankRawText.ts", name: "blankRawText", source: `if (value === "") return;`, violations: 1 },
      {
        filePath: "blankRawTextFlipped.ts",
        name: "blankRawTextFlipped",
        source: `const isBlank = "" !== value;`,
        violations: 1,
      },
      {
        filePath: "blankNormalized.ts",
        name: "blankNormalized",
        source: `if (normalizeString(value) === "") return;`,
        violations: 0,
      },
      {
        filePath: "blankRawTextInTemplate.vue",
        name: "blankRawTextInTemplate",
        source: `<template>\n  <UiButton :is-disabled="value === ''" />\n</template>`,
        violations: 1,
      },
    ],
  });
});
