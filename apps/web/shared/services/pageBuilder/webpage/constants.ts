import { WebpageNodeType } from "#shared/models/pageBuilder/webpage/WebpageNodeType";

// What the page itself, a section, a column and a tab may hold: every type but the two only their parent creates
export const WEBPAGE_CONTENT_NODE_TYPES = Object.values(WebpageNodeType).filter(
  (type) => type !== WebpageNodeType.Column && type !== WebpageNodeType.Tab,
);
// The page's reset, ahead of every type's structural CSS and every node's rules
export const PAGE_BASE_CSS =
  "*,::before,::after{box-sizing:border-box}body{margin:0}img,video{max-width:100%;height:auto}";
