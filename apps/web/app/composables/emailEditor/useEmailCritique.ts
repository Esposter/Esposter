import { critiqueEmail } from "#shared/services/pageBuilder/email/critique/critiqueEmail";
import { getCritiqueEditorFinding } from "#src/services/pageBuilder/getCritiqueEditorFinding";
import { readBrowserColor } from "#src/services/shared/readBrowserColor";
import { usePageBuilderDocumentStore } from "#src/store/pageBuilder/document";

// The critique of the open email, unsaved edits included, as the findings the problems surface lists. Each is a warning, and
// The save never reads them, so a finding informs and nothing waits on it
export const useEmailCritique = (resourceId: MaybeRefOrGetter<string>) => {
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { getEmailDocument } = pageBuilderDocumentStore;

  return useEditorFindings(
    () => getEmailDocument(toValue(resourceId)),
    (document) => {
      if (!document) return [];

      return critiqueEmail(document, { readColor: readBrowserColor }).map((finding) =>
        getCritiqueEditorFinding(finding),
      );
    },
  );
};
