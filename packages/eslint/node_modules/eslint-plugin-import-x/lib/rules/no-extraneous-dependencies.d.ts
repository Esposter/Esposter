type Options = {
    packageDir?: string | string[];
    devDependencies?: boolean;
    optionalDependencies?: boolean;
    peerDependencies?: boolean;
    bundledDependencies?: boolean;
    includeInternal?: boolean;
    includeTypes?: boolean;
};
type MessageId = 'pkgNotFound' | 'pkgUnparsable' | 'devDep' | 'optDep' | 'missing';
declare const _default: import("@typescript-eslint/utils/dist/ts-eslint").RuleModule<MessageId, [(Options | undefined)?], import("@typescript-eslint/utils/dist/ts-eslint").RuleListener>;
export = _default;
