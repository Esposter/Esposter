// Marks the thread pane in the DOM so a file dropped anywhere inside it attaches to the pane's composer rather
// Than to the room's. One document-level drop zone reads this off the drop's own element, where a second zone
// Nested inside the first would fire for the same drop and upload it twice
export const THREAD_COMPOSER_DROP_ZONE_ATTRIBUTE = "data-thread-composer";
