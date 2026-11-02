import type { CritiqueFinding } from "#shared/models/pageBuilder/CritiqueFinding";
import type { CritiqueSources } from "#shared/models/pageBuilder/CritiqueSources";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { PAGE_BACKGROUND_COLOR, PAGE_TEXT_COLOR } from "#shared/services/pageBuilder/critique/constants";
import { critiqueWebpageNodes } from "#shared/services/pageBuilder/critique/critiqueWebpageNodes";

// The critique of a webpage document, from the page's own colours down through each node's ancestors
export const critiqueWebpage = (document: WebpageDocument, sources: CritiqueSources): CritiqueFinding[] =>
  critiqueWebpageNodes(document.content, { background: PAGE_BACKGROUND_COLOR, textColor: PAGE_TEXT_COLOR }, sources);
