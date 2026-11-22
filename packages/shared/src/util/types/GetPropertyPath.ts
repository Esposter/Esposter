// A property's path: its key alone at the root, and its key joined onto the path of its parent below the root
export type GetPropertyPath<P extends string, K extends string, R extends boolean> = R extends true ? K : `${P}.${K}`;
