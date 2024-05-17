import type { TSESLint } from '@typescript-eslint/utils';
type Options = {
    considerQueryString?: boolean;
    'prefer-inline'?: boolean;
};
declare const _default: TSESLint.RuleModule<"duplicate", [(Options | undefined)?], TSESLint.RuleListener>;
export = _default;
