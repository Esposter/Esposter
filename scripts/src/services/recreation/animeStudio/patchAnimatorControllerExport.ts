import { replaceCounted } from "#src/services/recreation/animeStudio/replaceCounted";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The controller's state machine is parsed into a local and dropped, so the JSON export holds only its two lists. Kept
// As a public field, the exporter writes its layers, state machines and states beside them, and the reader's branches
// Are unchanged
export const patchAnimatorControllerExport = (animeStudioDirectory: string): void => {
  const path = join(animeStudioDirectory, "AnimeStudio", "Classes", "AnimatorController.cs");
  const source = readFileSync(path, "utf8");
  const patched = replaceCounted(
    replaceCounted(
      source,
      path,
      "        public Dictionary<uint, string> m_TOS;\n",
      "        public ControllerConstant m_Controller;\n        public Dictionary<uint, string> m_TOS;\n",
      1,
    ),
    path,
    "            var m_Controller = new ControllerConstant(reader);\n",
    "            m_Controller = new ControllerConstant(reader);\n",
    1,
  );
  writeFileSync(path, patched);
};
