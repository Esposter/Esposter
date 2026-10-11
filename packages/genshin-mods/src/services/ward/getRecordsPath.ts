// One file every session on the machine reads afresh, beside the persona's state, so an edit made a moment ago in
// Another session is always seen
export const getRecordsPath = (home: string): string => `${home}/.claude/genshin-mods/ward.json`;
