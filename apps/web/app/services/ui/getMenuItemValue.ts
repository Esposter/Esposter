// An item's title is unique within its list, so it is the value its menu hands back, and a child's is its parent's
// Title and its own, so the same title under two groups — a format under Import and under Export — stays two choices
export const getMenuItemValue = (title: string, parentTitle?: string) =>
  parentTitle === undefined ? title : `${parentTitle}/${title}`;
