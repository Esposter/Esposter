import type { ModuleOptions } from '../utils';
type Options = ModuleOptions & {
    allowUnsafeDynamicCyclicDependency?: boolean;
    ignoreExternal?: boolean;
    maxDepth?: number;
};
declare const _default: import("@typescript-eslint/utils/dist/ts-eslint").RuleModule<"cycle", [(Options | undefined)?], import("@typescript-eslint/utils/dist/ts-eslint").RuleListener>;
export = _default;
