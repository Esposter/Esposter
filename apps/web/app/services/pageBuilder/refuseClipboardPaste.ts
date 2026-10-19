import { PageBuilderEditor } from "@/models/pageBuilder/PageBuilderEditor";

// The message that refuses a paste, or none when the paste is allowed. A webpage node never goes into an email
export const refuseClipboardPaste = ({ source, target }: { source: PageBuilderEditor; target: PageBuilderEditor }) =>
  source === PageBuilderEditor.Webpage && target === PageBuilderEditor.Email
    ? "A webpage block cannot be pasted into an email"
    : undefined;
