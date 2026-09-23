import type { FlowMapSourceContext } from "@@/scripts/flowMap/models/FlowMapSourceContext";
import type { FlowMapSourceNode } from "@@/scripts/flowMap/models/FlowMapSourceNode";
import type { TemplateChildNode } from "@vue/compiler-core";

import {
  CLIENT_DIRECTORIES,
  DEFAULT_LAYOUT,
  IDENTIFIER_REGEX,
  IMPORT_SPECIFIER_REGEX,
  LAYOUT_META_REGEX,
  LAZY_COMPONENT_PREFIX,
  MIDDLEWARE_META_REGEX,
  QUOTED_STRING_REGEX,
  ROUTE_PATH_REFERENCE_REGEX,
  SOURCE_ALIAS_DIRECTORY_MAP,
  SOURCE_EXTENSIONS,
  WEB_DIRECTORY,
} from "@@/scripts/flowMap/constants";
import { ElementTypes, NodeTypes } from "@vue/compiler-core";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parse } from "vue/compiler-sfc";

const resolveSpecifier = (path: string, specifier: string) => {
  const aliasEntry = Object.entries(SOURCE_ALIAS_DIRECTORY_MAP).find(([alias]) => specifier.startsWith(alias));
  const base = aliasEntry
    ? resolve(WEB_DIRECTORY, aliasEntry[1], specifier.slice(aliasEntry[0].length))
    : specifier.startsWith(".")
      ? resolve(dirname(path), specifier)
      : undefined;
  if (!base) return undefined;
  return SOURCE_EXTENSIONS.map((extension) => `${base}${extension}`).find(
    (candidate) =>
      CLIENT_DIRECTORIES.some((directory) => candidate.startsWith(resolve(WEB_DIRECTORY, directory))) &&
      existsSync(candidate) &&
      statSync(candidate).isFile(),
  );
};

const readComponentTags = (children: TemplateChildNode[]): { name?: string; tag: string }[] =>
  children.flatMap((child) => {
    if (child.type !== NodeTypes.ELEMENT) return [];
    const nameProp = child.props.find((prop) => prop.type === NodeTypes.ATTRIBUTE && prop.name === "name");
    const tags = readComponentTags(child.children);
    if (child.tagType !== ElementTypes.COMPONENT) return tags;
    return [
      { name: nameProp?.type === NodeTypes.ATTRIBUTE ? nameProp.value?.content : undefined, tag: child.tag },
      ...tags,
    ];
  });
// What one file leads to: the files it names — by import, by component tag, by auto-imported composable, by its
// Layout and its middleware — and the RoutePath entries it references itself
export const readSourceNode = (path: string, context: FlowMapSourceContext): FlowMapSourceNode => {
  const source = readFileSync(path, "utf8");
  const layout = LAYOUT_META_REGEX.exec(source)?.groups?.layout ?? DEFAULT_LAYOUT;
  const middlewareNames = Array.from(
    MIDDLEWARE_META_REGEX.exec(source)?.groups?.middleware?.matchAll(QUOTED_STRING_REGEX) ?? [],
    ({ groups }) => groups?.value,
  );
  const templateAst = path.endsWith(".vue") ? parse(source).descriptor.template?.ast : undefined;
  const componentPaths = readComponentTags(templateAst?.children ?? []).map(({ name, tag }) => {
    if (tag === "NuxtLayout") return context.layoutPathMap.get(name ?? layout);
    const key = tag.replaceAll("-", "").toLowerCase();
    return (
      context.componentPathMap.get(key) ??
      (key.startsWith(LAZY_COMPONENT_PREFIX)
        ? context.componentPathMap.get(key.slice(LAZY_COMPONENT_PREFIX.length))
        : undefined)
    );
  });
  const dependencies = [
    ...Array.from(source.matchAll(IMPORT_SPECIFIER_REGEX), ({ groups }) =>
      resolveSpecifier(path, groups?.specifier ?? ""),
    ),
    ...Array.from(new Set(source.match(IDENTIFIER_REGEX)), (identifier) => context.autoImportPathMap.get(identifier)),
    ...middlewareNames.map((name) => (name ? context.middlewarePathMap.get(name) : undefined)),
    ...componentPaths,
  ]
    .filter((dependency) => dependency !== undefined)
    .filter((dependency) => dependency !== path);
  return {
    dependencies: [...new Set(dependencies)],
    routePathKeys: [
      ...new Set(Array.from(source.matchAll(ROUTE_PATH_REFERENCE_REGEX), ({ groups }) => groups?.key ?? "")),
    ],
  };
};
