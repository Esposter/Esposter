import type { ResourceLinkTarget } from "#server/models/resource/link/ResourceLinkTarget";
import type { ResourceLinkType } from "@esposter/db-schema";

import { RESOURCE_LINK_TYPE_KEYWORD } from "#server/services/resource/link/constants";
import { getResourceLinkKey } from "#server/services/resource/link/getResourceLinkKey";
import { resourceLinkRegistry } from "#shared/services/resource/link/resourceLinkRegistry";
import { resourceLinkTypeSchema } from "@esposter/db-schema";
import { z } from "zod";

type JsonSchemaNode = z.core.JSONSchema.JSONSchema;

const getResourceLinkType = (node: JsonSchemaNode): ResourceLinkType | undefined =>
  resourceLinkTypeSchema.safeParse(node[RESOURCE_LINK_TYPE_KEYWORD]).data;
// Reads a schema's links once, from the JSON Schema Zod emits for it rather than from Zod's internals, and returns
// What collects them from one parsed value — or nothing when the schema declares no link, so a caller asks only
// Of the shapes that can hold one. The schema is walked as the value goes rather than along paths fixed in
// Advance, which is what reaches a link inside a recursive shape at whatever depth the value nests it
export const createGetResourceLinkTargets = (schema: z.ZodType) => {
  const rootNode: JsonSchemaNode = z.toJSONSchema(schema, {
    override: ({ jsonSchema, zodSchema }) => {
      const resourceLinkType = resourceLinkRegistry.get(zodSchema)?.resourceLinkType;
      if (resourceLinkType) jsonSchema[RESOURCE_LINK_TYPE_KEYWORD] = resourceLinkType;
    },
    // A transform or a class has no JSON Schema, and neither holds a link, so it walks as an empty node
    unrepresentable: "any",
  });
  const resolveReference = (reference: string) =>
    reference === "#" ? rootNode : rootNode.$defs?.[reference.replace("#/$defs/", "")];
  const getChildNodes = ({
    $ref,
    additionalProperties,
    allOf,
    anyOf,
    items,
    oneOf,
    properties,
  }: JsonSchemaNode): JsonSchemaNode[] =>
    [
      ...Object.values(properties ?? {}),
      ...[items ?? []].flat(),
      additionalProperties,
      ...(allOf ?? []),
      ...(anyOf ?? []),
      ...(oneOf ?? []),
      $ref ? resolveReference($ref) : undefined,
    ].filter((childNode) => typeof childNode === "object");
  const nodes = new Set([rootNode]);
  for (const node of nodes) for (const childNode of getChildNodes(node)) nodes.add(childNode);
  // Every node a link can be reached from, grown backwards from the link fields until it stops changing — a
  // Recursive shape is a cycle, so one pass cannot settle it. The walk below never enters any other node, which
  // Is what keeps a large document whose links sit in one corner from being read whole
  const linkingNodes = new Set([...nodes].filter((node) => getResourceLinkType(node)));
  if (linkingNodes.size === 0) return undefined;

  let isLinkingNodesChanged = true;
  while (isLinkingNodesChanged) {
    isLinkingNodesChanged = false;
    for (const node of nodes)
      if (!linkingNodes.has(node) && getChildNodes(node).some((childNode) => linkingNodes.has(childNode))) {
        linkingNodes.add(node);
        isLinkingNodesChanged = true;
      }
  }

  return (value: unknown): ResourceLinkTarget[] => {
    // Once each: two visuals binding the same Sheet are one link
    const keyResourceLinkTargetMap = new Map<string, ResourceLinkTarget>();
    const walk = (node: JsonSchemaNode | undefined, nodeValue: unknown) => {
      if (!node || !linkingNodes.has(node)) return;

      const resourceLinkType = getResourceLinkType(node);
      // An empty id is the field's absence rather than a link, so it never reaches the uuid column
      if (resourceLinkType && typeof nodeValue === "string" && nodeValue) {
        const resourceLinkTarget = { targetId: nodeValue, type: resourceLinkType };
        keyResourceLinkTargetMap.set(getResourceLinkKey(resourceLinkTarget), resourceLinkTarget);
      }
      if (node.$ref) walk(resolveReference(node.$ref), nodeValue);
      // A union's value is one of its variants at this same place, so each variant reads it
      for (const variantNode of [...(node.allOf ?? []), ...(node.anyOf ?? []), ...(node.oneOf ?? [])])
        walk(variantNode, nodeValue);
      if (typeof nodeValue !== "object" || nodeValue === null) return;
      else if (Array.isArray(nodeValue)) {
        for (const itemNode of [node.items ?? []].flat())
          if (typeof itemNode === "object") for (const item of nodeValue) walk(itemNode, item);
        return;
      }

      for (const [key, entryValue] of Object.entries(nodeValue)) {
        const propertyNode = node.properties?.[key] ?? node.additionalProperties;
        if (typeof propertyNode === "object") walk(propertyNode, entryValue);
      }
    };
    walk(rootNode, value);
    return [...keyResourceLinkTargetMap.values()];
  };
};
