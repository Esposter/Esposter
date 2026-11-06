import type { EditorFindingSeverity } from "@/models/editor/EditorFindingSeverity";

// A problem an editor's check finds in its document: the node it concerns, how serious it is and what it says. A node is
// named by its id, the form each editor's selection holds, and "" names the document as a whole, which selects no node
export interface EditorFinding {
  message: string;
  nodeId: string;
  severity: EditorFindingSeverity;
}
