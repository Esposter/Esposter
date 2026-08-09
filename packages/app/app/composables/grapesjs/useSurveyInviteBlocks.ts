import type { GrapesJsBlock } from "@/models/grapesjs/GrapesJsBlock";
import type { Resource } from "@esposter/db-schema";
import type { Editor } from "grapesjs";

import { SURVEY_INVITE_BLOCK_CATEGORY } from "@/services/grapesjs/constants";
import { setBlocks } from "@/services/grapesjs/setBlocks";

// Both GrapesJS editors offer the owner's published surveys as invite blocks and differ in nothing but the
// Button markup, so the category re-sync lives here and each editor passes only its block renderer.
// The editor is watched alongside the surveys because a session-driven re-init drops every registered block
export const useSurveyInviteBlocks = (
  editor: Ref<Editor | undefined>,
  publishedSurveys: Ref<Resource[]>,
  createBlocks: (surveys: Resource[]) => GrapesJsBlock[],
) => {
  watch([editor, publishedSurveys], ([newEditor, newPublishedSurveys]) => {
    if (!newEditor) return;
    setBlocks(newEditor, SURVEY_INVITE_BLOCK_CATEGORY, createBlocks(newPublishedSurveys));
  });
};
