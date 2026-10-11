import type { RepairInput } from "#src/models/coderabbit/collect/RepairInput";
import type { Except } from "type-fest";

// The repairer's input less `main`'s head, which the step reads itself once the walk may have merged into it
export type RepairStepInput = Except<RepairInput, "mainSha">;
