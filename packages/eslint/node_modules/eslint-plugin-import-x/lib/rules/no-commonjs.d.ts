import type { TSESLint } from '@typescript-eslint/utils';
type NormalizedOptions = {
    allowPrimitiveModules?: boolean;
    allowRequire?: boolean;
    allowConditionalRequire?: boolean;
};
type Options = 'allow-primitive-modules' | NormalizedOptions;
type MessageId = 'export' | 'import';
declare const _default: TSESLint.RuleModule<MessageId, [(Options | undefined)?], TSESLint.RuleListener>;
export = _default;
