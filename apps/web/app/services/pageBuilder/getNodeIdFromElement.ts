// The id of the node an element sits in, read from the attribute the canvas's render stamps on each node's root element
export const getNodeIdFromElement = (element: Element | null): string | undefined =>
  element?.closest<HTMLElement>("[data-node-id]")?.dataset.nodeId;
