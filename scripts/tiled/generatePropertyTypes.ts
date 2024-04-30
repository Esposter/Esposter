import { PropertyType } from "@/scripts/tiled/models/PropertyType";
import type { PropertyTypes } from "@/scripts/tiled/models/PropertyTypes";
import { outputFile } from "@/scripts/tiled/util/outputFile";
import { getEnumString } from "@/scripts/util/getEnumString";

export const generatePropertyTypes = async (propertyTypes: PropertyTypes) => {
  const directory = "propertyTypes";
  const classObjectTypes: string[] = [];

  for (const propertyType of propertyTypes)
    if (propertyType.type === PropertyType.class) {
      const { name, type, members } = propertyType;
      const memberName = `${name}ObjectProperty`;
      await outputFile(
        `${directory}/${type}/${memberName}.ts`,
        getEnumString(
          memberName,
          members.map((m) => m.name),
        ),
      );
      classObjectTypes.push(name);
    } else if (propertyType.type === PropertyType.enum) {
      const { name, type, values } = propertyType;
      await outputFile(`${directory}/${type}/${name}.ts`, getEnumString(name, values));
    }

  const memberName = "ObjectType";
  await outputFile(`${directory}/${PropertyType.class}/${memberName}.ts`, getEnumString(memberName, classObjectTypes));
};
