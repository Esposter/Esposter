import type { GrapesJsBlock } from "@/models/grapesjs/GrapesJsBlock";
import type { ResourceInResource } from "@esposter/db-schema";

import { escapeHtml } from "#shared/util/text/escapeHtml";
import { ResourceType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

// The core behind the email editor's invite blocks: block identity plus the survey's public url. The caller passes
// The button's markup, so the list-to-blocks mapping owns none of it.
export const createSurveyInviteBlocks = (
  surveys: ResourceInResource[],
  renderButton: (button: { label: string; url: string }) => string,
): GrapesJsBlock[] =>
  surveys.map(({ id, name }) => {
    const label = escapeHtml(name);
    return {
      content: renderButton({ label, url: `${window.location.origin}${RoutePath.View(ResourceType.Survey, id)}` }),
      id: `survey-invite-${id}`,
      label,
    };
  });
