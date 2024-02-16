export type RemoveSuffix<T extends string, TSuffix extends string> = T extends `${infer P}${TSuffix}` ? P : never;
