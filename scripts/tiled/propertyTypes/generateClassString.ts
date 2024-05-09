import { PropertyType } from "@/models/dungeons/tilemap/PropertyType";
import type { TiledObjectProperty } from "@/models/dungeons/tilemap/TiledObjectProperty";
import type { ImportTypeLine } from "@/scripts/models/ImportTypeLine";
import type { InterfaceMember } from "@/scripts/models/InterfaceMember";
import { DIRECTORY } from "@/scripts/tiled/propertyTypes/constants";
import { ROOT_DIRECTORY } from "@/scripts/tiled/util/constants";
import { generateImportTypeLinesString } from "@/scripts/util/generateImportTypeLinesString";
import { generateInterfaceString } from "@/scripts/util/generateInterfaceString";

const ROOT_DIRECTORY_IMPORT_PATH = `@/${ROOT_DIRECTORY}/${DIRECTORY}`;

export const generateClassString = (name: string, members: TiledObjectProperty[]) => {
  const importLines: ImportTypeLine[] = [];
  const interfaceMembers: InterfaceMember[] = [];

  for (const member of members) {
    const { name, type } = member;

    if (type === PropertyType.class) {
      const { propertyType } = member;
      importLines.push({
        members: [propertyType],
        src: `${ROOT_DIRECTORY_IMPORT_PATH}/${PropertyType.class}/${propertyType}`,
      });
      interfaceMembers.push({ name, type: propertyType });
      continue;
    }
    // If we can narrow our string type to the specific tiled enum, why not? c:
    else if (type === PropertyType.string && member.propertyType) {
      const { propertyType } = member;
      importLines.push({
        members: [propertyType],
        src: `${ROOT_DIRECTORY_IMPORT_PATH}/${PropertyType.enum}/${propertyType}`,
      });
      interfaceMembers.push({ name, type: propertyType });
      continue;
    }

    interfaceMembers.push({ name, type: type === PropertyType.int ? "number" : type });
  }

  return `${generateImportTypeLinesString(importLines)}${generateInterfaceString(name, interfaceMembers)}`;
};
