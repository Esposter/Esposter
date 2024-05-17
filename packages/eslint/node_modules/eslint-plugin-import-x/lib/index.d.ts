import type { TSESLint } from '@typescript-eslint/utils';
import type { PluginConfig } from './types';
declare const _default: {
    configs: {
        recommended: {
            plugins: ["import-x"];
            rules: {
                'import-x/no-unresolved': "error";
                'import-x/named': "error";
                'import-x/namespace': "error";
                'import-x/default': "error";
                'import-x/export': "error";
                'import-x/no-named-as-default': "warn";
                'import-x/no-named-as-default-member': "warn";
                'import-x/no-duplicates': "warn";
            };
            parserOptions: {
                sourceType: "module";
                ecmaVersion: 2018;
            };
        };
        errors: {
            plugins: ["import-x"];
            rules: {
                'import-x/no-unresolved': 2;
                'import-x/named': 2;
                'import-x/namespace': 2;
                'import-x/default': 2;
                'import-x/export': 2;
            };
        };
        warnings: {
            plugins: ["import-x"];
            rules: {
                'import-x/no-named-as-default': 1;
                'import-x/no-named-as-default-member': 1;
                'import-x/no-duplicates': 1;
            };
        };
        'stage-0': PluginConfig;
        react: {
            settings: {
                'import-x/extensions': (".js" | ".jsx")[];
            };
            parserOptions: {
                ecmaFeatures: {
                    jsx: true;
                };
            };
        };
        'react-native': {
            settings: {
                'import-x/resolver': {
                    node: {
                        extensions: string[];
                    };
                };
            };
        };
        electron: {
            settings: {
                'import-x/core-modules': string[];
            };
        };
        typescript: {
            settings: {
                'import-x/extensions': readonly [".ts", ".tsx", ".js", ".jsx"];
                'import-x/external-module-folders': string[];
                'import-x/parsers': {
                    '@typescript-eslint/parser': (".ts" | ".tsx" | ".cts" | ".mts")[];
                };
                'import-x/resolver': {
                    node: {
                        extensions: readonly [".ts", ".tsx", ".js", ".jsx"];
                    };
                };
            };
            rules: {
                'import-x/named': "off";
            };
        };
    };
    rules: {
        'no-unresolved': TSESLint.RuleModule<"unresolved" | "casingMismatch", [((import("./utils").ModuleOptions & {
            caseSensitive?: boolean | undefined;
            caseSensitiveStrict?: boolean | undefined;
        }) | undefined)?], TSESLint.RuleListener>;
        named: TSESLint.RuleModule<"notFound" | "notFoundDeep", [(import("./utils").ModuleOptions | undefined)?], TSESLint.RuleListener>;
        default: TSESLint.RuleModule<"noDefaultExport", [], TSESLint.RuleListener>;
        namespace: TSESLint.RuleModule<"noNamesFound" | "computedReference" | "namespaceMember" | "topLevelNames" | "notFoundInNamespace", [{
            allowComputed?: boolean | undefined;
        }], TSESLint.RuleListener>;
        'no-namespace': TSESLint.RuleModule<"noNamespace", [({
            ignore?: string[] | undefined;
        } | undefined)?], TSESLint.RuleListener>;
        export: TSESLint.RuleModule<"noNamed" | "multiDefault" | "multiNamed", [], TSESLint.RuleListener>;
        'no-mutable-exports': TSESLint.RuleModule<"noMutable", [], TSESLint.RuleListener>;
        extensions: TSESLint.RuleModule<"missing" | "unexpected", (string | {
            defaultConfig?: string | undefined;
            pattern?: Record<`.${string}`, string> | undefined;
            ignorePackages?: boolean | undefined;
        })[], TSESLint.RuleListener>;
        'no-restricted-paths': TSESLint.RuleModule<"path" | "mixedGlob" | "glob" | "zone", [({
            basePath?: string | undefined;
            zones?: {
                from: import("./types").Arrayable<string>;
                target: import("./types").Arrayable<string>;
                message?: string | undefined;
                except?: string[] | undefined;
            }[] | undefined;
        } | undefined)?], TSESLint.RuleListener>;
        'no-internal-modules': TSESLint.RuleModule<"noAllowed", [({
            allow?: string[] | undefined;
            forbid?: string[] | undefined;
        } | undefined)?], TSESLint.RuleListener>;
        'group-exports': TSESLint.RuleModule<"ExportNamedDeclaration" | "AssignmentExpression", [], TSESLint.RuleListener>;
        'no-relative-packages': TSESLint.RuleModule<"noAllowed", [(import("./utils").ModuleOptions | undefined)?], TSESLint.RuleListener>;
        'no-relative-parent-imports': TSESLint.RuleModule<"noAllowed", [(import("./utils").ModuleOptions | undefined)?], TSESLint.RuleListener>;
        'consistent-type-specifier-style': TSESLint.RuleModule<"inline" | "topLevel", [(("prefer-inline" | "prefer-top-level") | undefined)?], TSESLint.RuleListener>;
        'no-self-import': TSESLint.RuleModule<"self", [], TSESLint.RuleListener>;
        'no-cycle': TSESLint.RuleModule<"cycle", [((import("./utils").ModuleOptions & {
            allowUnsafeDynamicCyclicDependency?: boolean | undefined;
            ignoreExternal?: boolean | undefined;
            maxDepth?: number | undefined;
        }) | undefined)?], TSESLint.RuleListener>;
        'no-named-default': TSESLint.RuleModule<"default", [], TSESLint.RuleListener>;
        'no-named-as-default': TSESLint.RuleModule<"default", [], TSESLint.RuleListener>;
        'no-named-as-default-member': TSESLint.RuleModule<"member", [], TSESLint.RuleListener>;
        'no-anonymous-default-export': TSESLint.RuleModule<"assign" | "anonymous", [({
            allowArray?: boolean | undefined;
            allowArrowFunction?: boolean | undefined;
            allowCallExpression?: boolean | undefined;
            allowAnonymousClass?: boolean | undefined;
            allowAnonymousFunction?: boolean | undefined;
            allowLiteral?: boolean | undefined;
            allowObject?: boolean | undefined;
            allowNew?: boolean | undefined;
        } | undefined)?], TSESLint.RuleListener>;
        'no-unused-modules': TSESLint.RuleModule<"notFound" | "unused", {
            src?: string[] | undefined;
            ignoreExports?: string[] | undefined;
            missingExports?: string[] | undefined;
            unusedExports?: boolean | undefined;
        }[], TSESLint.RuleListener>;
        'no-commonjs': TSESLint.RuleModule<"import" | "export", [(({
            allowPrimitiveModules?: boolean | undefined;
            allowRequire?: boolean | undefined;
            allowConditionalRequire?: boolean | undefined;
        } | "allow-primitive-modules") | undefined)?], TSESLint.RuleListener>;
        'no-amd': TSESLint.RuleModule<"amd", [], TSESLint.RuleListener>;
        'no-duplicates': TSESLint.RuleModule<"duplicate", [({
            considerQueryString?: boolean | undefined;
            'prefer-inline'?: boolean | undefined;
        } | undefined)?], TSESLint.RuleListener>;
        first: TSESLint.RuleModule<"absolute" | "order", [("absolute-first" | undefined)?], TSESLint.RuleListener>;
        'max-dependencies': TSESLint.RuleModule<"max", [({
            ignoreTypeImports?: boolean | undefined;
            max?: number | undefined;
        } | undefined)?], TSESLint.RuleListener>;
        'no-extraneous-dependencies': TSESLint.RuleModule<"missing" | "pkgNotFound" | "pkgUnparsable" | "devDep" | "optDep", [({
            packageDir?: string | string[] | undefined;
            devDependencies?: boolean | undefined;
            optionalDependencies?: boolean | undefined;
            peerDependencies?: boolean | undefined;
            bundledDependencies?: boolean | undefined;
            includeInternal?: boolean | undefined;
            includeTypes?: boolean | undefined;
        } | undefined)?], TSESLint.RuleListener>;
        'no-absolute-path': TSESLint.RuleModule<"absolute", [(import("./utils").ModuleOptions | undefined)?], TSESLint.RuleListener>;
        'no-nodejs-modules': TSESLint.RuleModule<"builtin", [({
            allow?: string[] | undefined;
        } | undefined)?], TSESLint.RuleListener>;
        'no-webpack-loader-syntax': TSESLint.RuleModule<"unexpected", [], TSESLint.RuleListener>;
        order: TSESLint.RuleModule<"error" | "order" | "noLineWithinGroup" | "noLineBetweenGroups" | "oneLineBetweenGroups", [({
            'newlines-between'?: "ignore" | "always" | "never" | "always-and-inside-groups" | undefined;
            alphabetize?: Partial<import("./types").AlphabetizeOptions> | undefined;
            distinctGroup?: boolean | undefined;
            groups?: readonly import("./types").Arrayable<import("./types").ImportType>[] | undefined;
            pathGroupsExcludedImportTypes?: import("./types").ImportType[] | undefined;
            pathGroups?: import("./types").PathGroup[] | undefined;
            warnOnUnassignedImports?: boolean | undefined;
        } | undefined)?], TSESLint.RuleListener>;
        'newline-after-import': TSESLint.RuleModule<"newline", [({
            count?: number | undefined;
            exactCount?: boolean | undefined;
            considerComments?: boolean | undefined;
        } | undefined)?], TSESLint.RuleListener>;
        'prefer-default-export': TSESLint.RuleModule<"any" | "single", [({
            target?: "any" | "single" | undefined;
        } | undefined)?], TSESLint.RuleListener>;
        'no-default-export': TSESLint.RuleModule<"preferNamed" | "noAliasDefault", [], TSESLint.RuleListener>;
        'no-named-export': TSESLint.RuleModule<"noAllowed", [], TSESLint.RuleListener>;
        'no-dynamic-require': TSESLint.RuleModule<"import" | "require", [({
            esmodule?: boolean | undefined;
        } | undefined)?], TSESLint.RuleListener>;
        unambiguous: TSESLint.RuleModule<"module", [], TSESLint.RuleListener>;
        'no-unassigned-import': TSESLint.RuleModule<"unassigned", [({
            allow?: string[] | undefined;
        } | undefined)?], TSESLint.RuleListener>;
        'no-useless-path-segments': TSESLint.RuleModule<"useless", [((import("./utils").ModuleOptions & {
            noUselessIndex?: boolean | undefined;
        }) | undefined)?], TSESLint.RuleListener>;
        'dynamic-import-chunkname': TSESLint.RuleModule<"leadingComment" | "blockComment" | "paddedSpaces" | "webpackComment" | "chunknameFormat", [({
            allowEmpty?: boolean | undefined;
            importFunctions?: readonly string[] | undefined;
            webpackChunknameFormat?: string | undefined;
        } | undefined)?], TSESLint.RuleListener>;
        'no-import-module-exports': TSESLint.RuleModule<"notAllowed", [({
            exceptions?: string[] | undefined;
        } | undefined)?], TSESLint.RuleListener>;
        'no-empty-named-blocks': TSESLint.RuleModule<"emptyNamed" | "unused" | "emptyImport", [], TSESLint.RuleListener>;
        'exports-last': TSESLint.RuleModule<"end", [], TSESLint.RuleListener>;
        'no-deprecated': TSESLint.RuleModule<"deprecated", [], TSESLint.RuleListener>;
        'imports-first': TSESLint.RuleModule<"absolute" | "order", [("absolute-first" | undefined)?], TSESLint.RuleListener>;
    };
};
export = _default;
