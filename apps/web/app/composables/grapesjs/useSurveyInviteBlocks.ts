import type { GrapesJsBlock } from "@/models/grapesjs/GrapesJsBlock";
import type { ResourceInResource } from "@esposter/db-schema";
import type { Editor } from "grapesjs";

import { SURVEY_INVITE_BLOCK_CATEGORY } from "@/services/grapesjs/constants";
import { setBlocks } from "@/services/grapesjs/setBlocks";

// The email editor offers the owner's published surveys as invite blocks. The category re-sync lives here, and the
// Editor passes its block renderer.
// The editor is watched alongside the surveys because a session-driven re-init drops every registered block
export const useSurveyInviteBlocks = (
  editor: Ref<Editor | undefined>,
  publishedSurveys: Ref<ResourceInResource[]>,
  createBlocks: (surveys: ResourceInResource[]) => GrapesJsBlock[],
) => {
  watch([editor, publishedSurveys], ([newEditor, newPublishedSurveys]) => {
    if (!newEditor) return;
    setBlocks(newEditor, SURVEY_INVITE_BLOCK_CATEGORY, createBlocks(newPublishedSurveys));
  });
};
