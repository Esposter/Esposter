// The id of the node an event target sits in, read from the attribute the canvas's render stamps on each node's root element
export const getNodeIdFromElement = (target: EventTarget | null): string | undefined =>
  target instanceof Element ? target.closest<HTMLElement>("[data-node-id]")?.dataset.nodeId : undefined;
