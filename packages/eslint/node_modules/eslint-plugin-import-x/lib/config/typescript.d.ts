declare const _default: {
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
export = _default;
