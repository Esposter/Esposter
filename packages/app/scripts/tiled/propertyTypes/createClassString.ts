import type { TiledObjectProperty } from "@/models/dungeons/tilemap/TiledObjectProperty";
import type { ImportTypeLine } from "@@/scripts/models/ImportTypeLine";
import type { InterfaceProperty } from "@@/scripts/models/InterfaceProperty";

import { PropertyType } from "@/models/dungeons/tilemap/PropertyType";
import { TILED_ROOT_DIRECTORY } from "@@/scripts/tiled/constants";
import { DIRECTORY } from "@@/scripts/tiled/propertyTypes/constants";
import { createImportTypeLinesString } from "@@/scripts/util/createImportTypeLinesString";
import { createInterfaceString } from "@@/scripts/util/createInterfaceString";

const TILED_ROOT_DIRECTORY_IMPORT_PATH = `#${TILED_ROOT_DIRECTORY}/${DIRECTORY}`;

export const createClassString = (name: string, properties: TiledObjectProperty[]) => {
  const importLines: ImportTypeLine[] = [];
  const interfaceProperties: InterfaceProperty[] = [];

  for (const property of properties) {
    const { name, type } = property;

    if (type === PropertyType.class) {
      const { propertyType } = property;
      importLines.push({
        properties: [propertyType],
        src: `${TILED_ROOT_DIRECTORY_IMPORT_PATH}/${PropertyType.class}/${propertyType}`,
      });
      interfaceProperties.push({ name, type: propertyType });
      continue;
    }
    // If we can narrow our string type to the specific tiled enum, why not? c:
    else if (type === PropertyType.string && property.propertyType) {
      const { propertyType } = property;
      importLines.push({
        properties: [propertyType],
        src: `${TILED_ROOT_DIRECTORY_IMPORT_PATH}/${PropertyType.enum}/${propertyType}`,
      });
      interfaceProperties.push({ name, type: propertyType });
      continue;
    }

    interfaceProperties.push({ name, type: type === PropertyType.int ? "number" : type });
  }

  return `${createImportTypeLinesString(importLines)}${createInterfaceString(name, interfaceProperties)}`;
};
