import type { ModuleOptions } from '../utils';
type Options = ModuleOptions & {
    caseSensitive?: boolean;
    caseSensitiveStrict?: boolean;
};
type MessageId = 'unresolved' | 'casingMismatch';
declare const _default: import("@typescript-eslint/utils/dist/ts-eslint").RuleModule<MessageId, [(Options | undefined)?], import("@typescript-eslint/utils/dist/ts-eslint").RuleListener>;
export = _default;
