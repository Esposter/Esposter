import { PropertyType } from "@/scripts/tiled/models/PropertyType";
import type { TiledProject } from "@/scripts/tiled/models/TiledProject";
import { outputFile } from "@/scripts/tiled/util/outputFile";
import { generateEnumString } from "@/scripts/util/generateEnumString";
import { jsonDateParse } from "@/util/jsonDateParse";
import { readFile } from "node:fs/promises";

const filePath = "assets/dungeons/scene/world/index.tiled-project";
const directory = "propertyTypes";

export const generatePropertyTypes = async () => {
  const tiledProject: TiledProject = jsonDateParse(await readFile(filePath, "utf-8"));
  const classObjectTypes: string[] = [];

  for (const propertyType of tiledProject.propertyTypes)
    if (propertyType.type === PropertyType.class) {
      const { name, type, members } = propertyType;
      const enumName = `${name}ObjectProperty`;
      await outputFile(
        `${directory}/${type}/${enumName}.ts`,
        generateEnumString(
          enumName,
          members.map((m) => m.name),
        ),
      );
      classObjectTypes.push(name);
    } else if (propertyType.type === PropertyType.enum) {
      const { name, type, values } = propertyType;
      await outputFile(`${directory}/${type}/${name}.ts`, generateEnumString(name, values));
    }

  const enumName = "ObjectType";
  await outputFile(`${directory}/${PropertyType.class}/${enumName}.ts`, generateEnumString(enumName, classObjectTypes));
};
