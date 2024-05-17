type MessageId = 'assign' | 'anonymous';
type Options = {
    allowArray?: boolean;
    allowArrowFunction?: boolean;
    allowCallExpression?: boolean;
    allowAnonymousClass?: boolean;
    allowAnonymousFunction?: boolean;
    allowLiteral?: boolean;
    allowObject?: boolean;
    allowNew?: boolean;
};
declare const _default: import("@typescript-eslint/utils/dist/ts-eslint").RuleModule<MessageId, [(Options | undefined)?], import("@typescript-eslint/utils/dist/ts-eslint").RuleListener>;
export = _default;
