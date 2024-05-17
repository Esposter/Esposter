type MessageId = 'noNamesFound' | 'computedReference' | 'namespaceMember' | 'topLevelNames' | 'notFoundInNamespace';
type Options = {
    allowComputed?: boolean;
};
declare const _default: import("@typescript-eslint/utils/dist/ts-eslint").RuleModule<MessageId, [Options], import("@typescript-eslint/utils/dist/ts-eslint").RuleListener>;
export = _default;
