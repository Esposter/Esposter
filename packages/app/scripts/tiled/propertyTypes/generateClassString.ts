import type { TiledObjectProperty } from "@/models/dungeons/tilemap/TiledObjectProperty";
import type { ImportTypeLine } from "@/scripts/models/ImportTypeLine";
import type { InterfaceProperty } from "@/scripts/models/InterfaceProperty";

import { PropertyType } from "@/models/dungeons/tilemap/PropertyType";
import { DIRECTORY } from "@/scripts/tiled/propertyTypes/constants";
import { ROOT_DIRECTORY } from "@/scripts/tiled/util/constants";
import { generateImportTypeLinesString } from "@/scripts/util/generateImportTypeLinesString";
import { generateInterfaceString } from "@/scripts/util/generateInterfaceString";

const ROOT_DIRECTORY_IMPORT_PATH = `@/${ROOT_DIRECTORY}/${DIRECTORY}`;

export const generateClassString = (name: string, properties: TiledObjectProperty[]) => {
  const importLines: ImportTypeLine[] = [];
  const interfaceProperties: InterfaceProperty[] = [];

  for (const property of properties) {
    const { name, type } = property;

    if (type === PropertyType.class) {
      const { propertyType } = property;
      importLines.push({
        properties: [propertyType],
        src: `${ROOT_DIRECTORY_IMPORT_PATH}/${PropertyType.class}/${propertyType}`,
      });
      interfaceProperties.push({ name, type: propertyType });
      continue;
    }
    // If we can narrow our string type to the specific tiled enum, why not? c:
    else if (type === PropertyType.string && property.propertyType) {
      const { propertyType } = property;
      importLines.push({
        properties: [propertyType],
        src: `${ROOT_DIRECTORY_IMPORT_PATH}/${PropertyType.enum}/${propertyType}`,
      });
      interfaceProperties.push({ name, type: propertyType });
      continue;
    }

    interfaceProperties.push({ name, type: type === PropertyType.int ? "number" : type });
  }

  return `${generateImportTypeLinesString(importLines)}${generateInterfaceString(name, interfaceProperties)}`;
};
