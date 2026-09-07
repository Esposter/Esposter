import type { GrapesJsBlock } from "@/models/grapesjs/GrapesJsBlock";
import type { Resource } from "@esposter/db-schema";

import { escapeHtml } from "@/util/text/escapeHtml";
import { ResourceType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

// The shared core behind the invite blocks both GrapesJS editors offer: block identity plus the survey's
// Public url. Only the button markup differs per surface (MJML for email, plain HTML for webpage),
// So each editor passes just its renderer rather than owning a copy of the list-to-blocks mapping.
export const createSurveyInviteBlocks = (
  surveys: Resource[],
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
