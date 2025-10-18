import type { ConfigExport } from "rolldown";

import rolldownConfigurationBase from "@esposter/configuration/rolldown.config.base.js";
import { defineConfig } from "rolldown";

const rolldownConfiguration: ConfigExport = defineConfig([{ ...rolldownConfigurationBase, external: [] }]);

export default rolldownConfiguration;
