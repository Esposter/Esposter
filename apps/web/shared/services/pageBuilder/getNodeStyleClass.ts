import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";

// The class a styled node carries, named from its id, so its rules reach that node alone
export const getNodeStyleClass = (node: WebpageNode): string => `pb-${node.props.id}`;
