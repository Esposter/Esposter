import { CLAUDE_PROJECTS_DIRECTORY } from "#src/services/shared/constants";
import { readdirSync } from "node:fs";
import { join } from "node:path";

// The project folders under Claude Code's projects folder whose name contains the text; empty takes them all
export const readProjectDirectories = (project: string): string[] =>
  readdirSync(CLAUDE_PROJECTS_DIRECTORY, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.includes(project))
    .map((entry) => join(CLAUDE_PROJECTS_DIRECTORY, entry.name));
