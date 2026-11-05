import type { RenameMap } from "#src/models/identifiers/rename/RenameMap";

import { renameIdentifiers } from "#src/services/identifiers/rename/renameIdentifiers";
import { readVueSegments } from "#src/services/shared/readVueSegments";

// A Vue file is renamed inside its script blocks alone: its template's text is prose a reader sees, and a name the
// Template binds is found by the typecheck rather than guessed at in markup
export const renameSource = (path: string, text: string, renameMap: RenameMap, isSource: boolean): string =>
  path.endsWith(".vue")
    ? readVueSegments(text)
        .map(({ isScript, text: segment }) => (isScript ? renameIdentifiers(segment, renameMap, isSource) : segment))
        .join("")
    : renameIdentifiers(text, renameMap, isSource);
