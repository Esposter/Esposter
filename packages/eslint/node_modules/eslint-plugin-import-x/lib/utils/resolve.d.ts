import type { ImportSettings, PluginSettings, RuleContext } from '../types';
export type ResultNotFound = {
    found: false;
    path?: undefined;
};
export type ResultFound = {
    found: true;
    path: string | null;
};
export type ResolvedResult = ResultNotFound | ResultFound;
export type ResolverResolve = (modulePath: string, sourceFile: string, config: unknown) => ResolvedResult;
export type ResolverResolveImport = (modulePath: string, sourceFile: string, config: unknown) => string | undefined;
export type Resolver = {
    interfaceVersion?: 1 | 2;
    resolve: ResolverResolve;
    resolveImport: ResolverResolveImport;
};
export declare const CASE_SENSITIVE_FS: boolean;
export declare function fileExistsWithCaseSync(filepath: string | null, cacheSettings?: ImportSettings['cache'], strict?: boolean): boolean;
export declare function relative(modulePath: string, sourceFile: string, settings: PluginSettings): string | null | undefined;
export declare function resolve(p: string, context: RuleContext): string | null | undefined;
