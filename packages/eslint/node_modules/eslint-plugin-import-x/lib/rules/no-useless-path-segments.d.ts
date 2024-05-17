import type { ModuleOptions } from '../utils';
type Options = ModuleOptions & {
    noUselessIndex?: boolean;
};
declare const _default: import("@typescript-eslint/utils/dist/ts-eslint").RuleModule<"useless", [(Options | undefined)?], import("@typescript-eslint/utils/dist/ts-eslint").RuleListener>;
export = _default;
