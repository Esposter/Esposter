import type { TiledProject } from "@/scripts/tiled/models/TiledProject";

import { PropertyType } from "@/models/dungeons/tilemap/PropertyType";
import { generateClassString } from "@/scripts/tiled/propertyTypes/generateClassString";
import { outputFile } from "@/scripts/tiled/util/outputFile";
import { generateEnumString } from "@/scripts/util/generateEnumString";
import { jsonDateParse } from "@/shared/util/time/jsonDateParse";
import { readFile } from "node:fs/promises";

const filePath = "assets/dungeons/scene/world/index.tiled-project";
const directory = "propertyTypes";

export const generatePropertyTypes = async () => {
  const tiledProject: TiledProject = jsonDateParse(await readFile(filePath, "utf-8"));
  const classObjectTypes: string[] = [];

  for (const propertyType of tiledProject.propertyTypes)
    if (propertyType.type === PropertyType.class) {
      const { members, name, type } = propertyType;
      const objectPropertyFilename = `${name}ObjectProperty`;
      await Promise.all([
        outputFile(`${directory}/${type}/${name}.ts`, generateClassString(name, members)),
        outputFile(
          `${directory}/${type}/${objectPropertyFilename}.ts`,
          generateEnumString(
            objectPropertyFilename,
            members.map((m) => m.name),
          ),
        ),
      ]);
      classObjectTypes.push(name);
    } else {
      const { name, type, values } = propertyType;
      await outputFile(`${directory}/${type}/${name}.ts`, generateEnumString(name, values));
    }

  const enumName = "ObjectType";
  await outputFile(`${directory}/${PropertyType.class}/${enumName}.ts`, generateEnumString(enumName, classObjectTypes));
};
