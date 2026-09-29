export const RESOURCE_ITEMS_MAX_LENGTH = 1000;
export const ITEM_NAME_MAX_LENGTH = 1000;
// Rich-text notes hold real documents (checklists, pasted content), so they get far more headroom
// Than the generic entity description
export const TODO_LIST_ITEM_NOTES_MAX_LENGTH = 100_000;
// A step is a line of a checklist, so a todo that needs more than this is several todos
export const TODO_LIST_ITEM_STEPS_MAX_LENGTH = 100;
// Every interval a repeat is set to, as the custom schedule's field takes it
export const TODO_LIST_RECURRENCE_INTERVAL_MAX = 999;
// A repository as `owner/name`, the form its origin remote names it by from every clone and machine, bounded by the
// Longest owner and name GitHub allows
export const TODO_LIST_ITEM_REPOSITORY_MAX_LENGTH = 140;
export const TODO_LIST_ITEM_REPOSITORY_REGEX = /^[\w.-]+\/[\w.-]+$/u;
