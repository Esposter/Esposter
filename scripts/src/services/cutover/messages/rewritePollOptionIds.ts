import { getCreatedAtUuidV7 } from "#src/services/cutover/ids/getCreatedAtUuidV7";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { z } from "zod";

const legacyPollSchema = z.looseObject({
  options: z.array(z.looseObject({ id: z.string() })),
  votes: z.record(z.string(), z.string()),
});

// A poll's options were minted as UUIDv4s inside its text, which no row or id map names, so each one is given a
// UUIDv7 of the poll's own time here, and every vote follows its option to the new id
export const rewritePollOptionIds = (text: string, createdAt: Date): string => {
  const poll = legacyPollSchema.parse(parseMachineJson(text));
  const oldIdNewIdMap = new Map(poll.options.map(({ id }) => [id, getCreatedAtUuidV7(createdAt)]));
  return JSON.stringify({
    ...poll,
    options: poll.options.map((option) => ({ ...option, id: oldIdNewIdMap.get(option.id) ?? option.id })),
    votes: Object.fromEntries(
      Object.entries(poll.votes).map(([userId, optionId]) => [userId, oldIdNewIdMap.get(optionId) ?? optionId]),
    ),
  });
};
