import { Breakpoint } from "#shared/models/pageBuilder/style/Breakpoint";
import { getMediaQueryCss } from "#shared/services/pageBuilder/style/getMediaQueryCss";

export const COLUMNS_CLASS = "page-columns";
// Side by side, and stacked at mobile width
export const COLUMNS_CSS = `.${COLUMNS_CLASS}{display:flex;gap:1rem}${getMediaQueryCss(Breakpoint.Mobile, `.${COLUMNS_CLASS}{flex-direction:column}`)}`;
export const DEFAULT_COLUMN_COUNT = 2;
