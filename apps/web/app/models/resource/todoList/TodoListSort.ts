// How the open todos are shown: the list's own order, or one of Microsoft To Do's sorts over it
export const TodoListSort = {
  Alphabetical: "Alphabetical",
  CreationDate: "CreationDate",
  DueDate: "DueDate",
  Importance: "Importance",
  MyOrder: "MyOrder",
} as const;
export type TodoListSort = (typeof TodoListSort)[keyof typeof TodoListSort];
