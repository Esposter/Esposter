import { homedir } from "node:os";
import { join } from "node:path";

export const PROJECTS_DIRECTORY: string = join(homedir(), ".claude", "projects");
export const MILLISECONDS_PER_DAY: number = Temporal.Duration.from({ hours: 24 }).total("milliseconds");
export const USAGE_FAMILIES: readonly string[] = ["opus", "sonnet", "haiku"];
export const SYNTHETIC_MODEL = "<synthetic>";
export const WORKFLOW_FOLDER = "/workflows/";
export const SUBAGENT_FOLDER = "/subagents/";
// Checked before a line is parsed, so only the lines that can hold a usage record or a user message are read as JSON
export const USAGE_MARKER = '"usage"';
export const USER_MARKER = '"type":"user"';
export const PROMPT_PREVIEW_LENGTH = 80;
export const TOP_TRANSCRIPT_COUNT = 8;
