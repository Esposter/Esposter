import { getResult, noop } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { z } from "zod";

const transcriptEntrySchema = z.object({ toolUseResult: z.unknown(), uuid: z.string() });
// What each tool result in a session's transcript recorded beside its content, by the entry's uuid: an edit's file
// Text from before it among it. The SDK's history reader drops it, so the transcript on disk is read for it, and a
// Resumed session's changes merge from where each file started as a live session's do. The transcript is found by its
// Session id, which is unique across the projects the terminal keeps
export const readToolUseResultMap = async (sessionId: string): Promise<Map<string, unknown>> => {
  const toolUseResultMap = new Map<string, unknown>();
  const projectsDirectory = join(process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), ".claude"), "projects");
  if (!existsSync(projectsDirectory)) return toolUseResultMap;
  const transcriptPath = (await readdir(projectsDirectory))
    .map((projectDirectory) => join(projectsDirectory, projectDirectory, `${sessionId}.jsonl`))
    .find((path) => existsSync(path));
  if (!transcriptPath) return toolUseResultMap;

  for (const line of (await readFile(transcriptPath, "utf8")).split("\n"))
    getResult(
      // oxlint-disable-next-line no-restricted-properties -- the entry schema validates the one field read
      () => transcriptEntrySchema.parse(JSON.parse(line)),
    ).match(({ toolUseResult, uuid }) => {
      if (toolUseResult !== undefined) toolUseResultMap.set(uuid, toolUseResult);
    }, noop);

  return toolUseResultMap;
};
