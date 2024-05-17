import type { PackageJson } from 'type-fest';
export declare function readPkgUp(opts?: {
    cwd?: string;
}): {
    pkg?: undefined;
    path?: undefined;
} | {
    pkg: {
        [x: string]: import("type-fest").JsonValue;
    } & {
        [x: string]: import("type-fest").JsonValue | undefined;
    } & PackageJson.NodeJsStandard & PackageJson.PackageJsonStandard & PackageJson.NonStandardEntryPoints & PackageJson.TypeScriptConfiguration & PackageJson.YarnConfiguration & PackageJson.JSPMConfiguration & {
        name: string;
    };
    path: string;
};
