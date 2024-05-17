import type { TSESLint } from '@typescript-eslint/utils';
type Options = {
    count?: number;
    exactCount?: boolean;
    considerComments?: boolean;
};
declare const _default: TSESLint.RuleModule<"newline", [(Options | undefined)?], TSESLint.RuleListener>;
export = _default;
