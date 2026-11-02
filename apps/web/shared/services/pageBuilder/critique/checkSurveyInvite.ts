import type { CritiqueFinding } from "#shared/models/pageBuilder/CritiqueFinding";
import type { CritiqueSources } from "#shared/models/pageBuilder/CritiqueSources";
import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";

import { CritiqueFindingKind } from "#shared/models/pageBuilder/CritiqueFindingKind";
import { SurveyPublishState } from "#shared/models/pageBuilder/SurveyPublishState";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { exhaustiveGuard } from "@esposter/shared";

export const checkSurveyInvite = (
  node: WebpageNode,
  lookupSurveyPublishState: CritiqueSources["lookupSurveyPublishState"],
): CritiqueFinding[] => {
  if (node.type !== WebpageNodeType.SurveyInvite) return [];

  const publishState = lookupSurveyPublishState(node.props.surveyId);
  switch (publishState) {
    case SurveyPublishState.Published:
      return [];
    case SurveyPublishState.Unpublished:
      return [{ kind: CritiqueFindingKind.UnpublishedSurvey, nodeId: node.props.id }];
    case SurveyPublishState.Unreadable:
      return [{ kind: CritiqueFindingKind.UncheckedSurvey, nodeId: node.props.id }];
    default:
      return exhaustiveGuard(publishState);
  }
};
