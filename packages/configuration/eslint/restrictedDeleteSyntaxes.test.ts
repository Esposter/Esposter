import { setupSyntaxSuite } from "#src/setupSyntaxSuite.test";
import restrictedDeleteSyntaxes from "@esposter/configuration/eslint/restrictedDeleteSyntaxes.js";
import { describe } from "vitest";

describe("restrictedDeleteSyntaxes", () => {
  setupSyntaxSuite({
    entries: restrictedDeleteSyntaxes,
    fixtures: [
      {
        filePath: "handlerDelete.vue",
        name: "handlerDelete",
        source: '<template>\n  <Atom @click="deleteFoo(id)" />\n</template>',
        violations: 1,
      },
      {
        filePath: "arrowHandlerRemove.vue",
        name: "arrowHandlerRemove",
        source: '<template>\n  <Atom @delete="(ids) => removeFoos(ids)" />\n</template>',
        violations: 1,
      },
      {
        filePath: "confirmDelete.vue",
        name: "confirmDelete",
        source: '<template>\n  <Atom :confirm="() => deleteFoo(id)" />\n</template>',
        violations: 0,
      },
      {
        filePath: "handlerTarget.vue",
        name: "handlerTarget",
        source: '<template>\n  <Atom @click="deletingId = id" />\n</template>',
        violations: 0,
      },
      {
        filePath: "itemOnClick.ts",
        name: "itemOnClick",
        source: 'export const items = [{ onClick: () => purgeFoo(""), title: "" }];',
        violations: 1,
      },
      {
        filePath: "itemOnClickTarget.ts",
        name: "itemOnClickTarget",
        source: 'export const items = [{ onClick: () => openFoo(""), title: "" }];',
        violations: 0,
      },
    ],
  });
});
