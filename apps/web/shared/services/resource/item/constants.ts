export const RESOURCE_ITEMS_MAX_LENGTH = 1000;
export const ITEM_NAME_MAX_LENGTH = 1000;
// Rich-text notes hold real documents (checklists, pasted content), so they get far more headroom
// Than the generic entity description
export const TODO_LIST_ITEM_NOTES_MAX_LENGTH = 100_000;
// A step is a line of a checklist, so a todo that needs more than this is several todos
export const TODO_LIST_ITEM_STEPS_MAX_LENGTH = 100;
