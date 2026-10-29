import type { SetupCommandTool } from "#src/models/setup/SetupCommandTool";
import type { SetupFileTool } from "#src/models/setup/SetupFileTool";

export type SetupTool = SetupCommandTool | SetupFileTool;
