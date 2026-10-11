import type { Talk } from "genshin-world";

import { TalkLineKind } from "genshin-world";

// The words a talk shows, by text id: each line's own, and a spoken line's speaker's name and role
export const getTalkTextIds = ({ lines }: Talk): string[] =>
  lines.flatMap((line) =>
    line.kind === TalkLineKind.Spoken ? [line.textId, line.speakerTextId, line.speakerRoleTextId] : [line.textId],
  );
