import { resolve } from "node:path";

export const WEB_DIRECTORY = resolve(import.meta.dirname, "../..");
export const COMPONENTS_DIRECTORY = "app/components";
export const PAGES_DIRECTORY = "app/pages";
export const AUTO_IMPORT_PATTERN = "app/composables/**/*.ts";
export const LAYOUT_PATTERN = "app/layouts/*.vue";
export const MIDDLEWARE_PATTERN = "app/middleware/*.ts";
export const NON_SOURCE_PATTERNS = ["**/*.test.ts", "**/*.bench.ts"];
export const DEFAULT_LAYOUT = "default";
export const LAZY_COMPONENT_PREFIX = "lazy";
export const SHELL_NODE_ID = "shell";
export const FLOW_MAP_PATH = resolve(WEB_DIRECTORY, "shared/generated/flowMap/flowMap.mmd");
// What a dynamic route is called with to find its page: any one segment does, since a node is the route's pattern
export const ROUTE_PARAMETER_PLACEHOLDER = "placeholder";
// Mounted on every page: the root component and the plugins, which reach the app bar and the redirects on sign-out
export const SHELL_ENTRY_PATTERNS = ["app/App.vue", "app/plugins/**/*.ts"];
// Only client code navigates: an import reaching the server is a type, and says nothing about where a reader can go
export const CLIENT_DIRECTORIES = ["app/", "shared/"];
export const SOURCE_ALIAS_DIRECTORY_MAP: Record<string, string> = {
  "#shared/": "shared/",
  "@/": "app/",
  "@@/": "",
  "~/": "app/",
};
export const SOURCE_EXTENSIONS = ["", ".ts", ".vue", "/index.ts"];

export const CASE_BOUNDARY_REGEX = /(?<=[\da-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/u;
export const EXPORT_NAME_REGEX = /export (?:async )?(?:const|function) (?<name>\w+)/gu;
export const IDENTIFIER_REGEX = /\b\w+\b/gu;
export const IMPORT_SPECIFIER_REGEX = /(?:from|import)\s*\(?\s*"(?<specifier>[^"]+)"/gu;
export const LAYOUT_META_REGEX = /layout:\s*"(?<layout>[\w-]+)"/u;
export const MIDDLEWARE_EXTENSION_REGEX = /(?:\.client|\.server)?\.ts$/u;
export const MIDDLEWARE_META_REGEX = /middleware:\s*(?<middleware>\[[^\]]*\]|"[^"]*")/u;
export const NODE_ID_SEPARATOR_REGEX = /[^\da-z]+/giu;
export const NAME_SEPARATOR_REGEX = /[-./\\_]+/u;
export const QUOTED_STRING_REGEX = /"(?<value>[^"]+)"/gu;
export const PAGE_EXTENSION_REGEX = /\.vue$/u;
export const ROUTE_PATH_REFERENCE_REGEX = /\bRoutePath\.(?<key>\w+)/gu;
