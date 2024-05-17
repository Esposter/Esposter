type Options = {
    src?: string[];
    ignoreExports?: string[];
    missingExports?: string[];
    unusedExports?: boolean;
};
type MessageId = 'notFound' | 'unused';
declare const _default: import("@typescript-eslint/utils/dist/ts-eslint").RuleModule<MessageId, Options[], import("@typescript-eslint/utils/dist/ts-eslint").RuleListener>;
export = _default;
