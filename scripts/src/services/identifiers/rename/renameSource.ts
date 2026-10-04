import type { RenameMap } from "#src/models/identifiers/rename/RenameMap";

import { renameIdentifiers } from "#src/services/identifiers/rename/renameIdentifiers";

// A Vue file is renamed inside its script blocks alone: its template's text is prose a reader sees, and a name the
// Template binds is found by the typecheck rather than guessed at in markup
export const renameSource = (path: string, text: string, renameMap: RenameMap, isSource: boolean): string =>
  path.endsWith(".vue")
    ? text.replaceAll(
        /(?<open><script[^>]*>)(?<script>[\s\S]*?)(?<close><\/script[^>]*>)/giu,
        (_match, open: string, script: string, close: string) =>
          `${open}${renameIdentifiers(script, renameMap, isSource)}${close}`,
      )
    : renameIdentifiers(text, renameMap, isSource);
