type Options = {
    allowEmpty?: boolean;
    importFunctions?: readonly string[];
    webpackChunknameFormat?: string;
};
type MessageId = 'leadingComment' | 'blockComment' | 'paddedSpaces' | 'webpackComment' | 'chunknameFormat';
declare const _default: import("@typescript-eslint/utils/dist/ts-eslint").RuleModule<MessageId, [(Options | undefined)?], import("@typescript-eslint/utils/dist/ts-eslint").RuleListener>;
export = _default;
