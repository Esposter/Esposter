import type { PortableResourceType } from "#shared/models/resource/PortableResourceType";
import type { PortableFormat } from "@/models/resource/PortableFormat";

import { exportPersonalizedHtml } from "@/services/emailEditor/exportPersonalizedHtml";
import { useAlertStore } from "@/store/alert";
import { useEmailEditorStore } from "@/store/emailEditor";
import { ResourceType } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
// Import/export formats per portable type. File's import/export land with its blade migration (roadmap Phase 4).
export const PortableFormatMap: Record<PortableResourceType, PortableFormat[]> = {
  [ResourceType.Email]: [
    {
      export: async () => {
        const { $trpc } = useNuxtApp();
        const { createAlert } = useAlertStore();
        // The live editor + bound dataset live on the email store (set by the blade); the export needs both
        const { datasetReference, editor, resource } = storeToRefs(useEmailEditorStore());
        const editorValue = editor.value;
        const resourceValue = resource.value;
        const referenceValue = datasetReference.value;
        if (!editorValue || !resourceValue || !referenceValue) {
          createAlert("Bind a dataset before exporting personalized HTML", "warning");
          return;
        }

        await getResultAsync(async () => {
          const dataset = await $trpc.dataset.readDataset.query(referenceValue);
          if (dataset.rows.length === 0) {
            createAlert("Dataset has no rows to export", "warning");
            return;
          }

          const count = exportPersonalizedHtml(editorValue, resourceValue, dataset.rows);
          createAlert(`Exported ${count} personalized emails`, "success");
        }).match(noop, (error) => {
          createAlert(error.message, "error");
        });
      },
      label: "Personalized HTML",
    },
  ],
  [ResourceType.File]: [],
};
