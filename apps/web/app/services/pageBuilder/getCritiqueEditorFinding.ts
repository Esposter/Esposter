import type { CritiqueFinding } from "#shared/models/pageBuilder/CritiqueFinding";
import type { EditorFinding } from "@/models/editor/EditorFinding";

import { EditorFindingSeverity } from "@/models/editor/EditorFindingSeverity";
import { getCritiqueFindingSummary } from "@/services/pageBuilder/getCritiqueFindingSummary";

// A critique finding as the problems surface lists it: the node it names by the id the page builder's selection holds,
// And the critique's own description. Every critique finding is a warning, since a contrast, a fixed width or a survey
// Invite stops neither a save nor a publish
export const getCritiqueEditorFinding = (finding: CritiqueFinding): EditorFinding => ({
  message: getCritiqueFindingSummary(finding).description,
  nodeId: finding.nodeId,
  severity: EditorFindingSeverity.Warning,
});
