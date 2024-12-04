import type { TiledProject } from "@@/scripts/tiled/models/TiledProject";

import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { PropertyType } from "@/models/dungeons/tilemap/PropertyType";
import { WORLD_ROOT_DIRECTORY } from "@@/scripts/tiled/constants";
import { DIRECTORY } from "@@/scripts/tiled/propertyTypes/constants";
import { generateClassString } from "@@/scripts/tiled/propertyTypes/generateClassString";
import { outputFile } from "@@/scripts/tiled/util/outputFile";
import { generateEnumString } from "@@/scripts/util/generateEnumString";
import { readFile } from "node:fs/promises";

const filePath = `${WORLD_ROOT_DIRECTORY}/index.tiled-project`;

export const generatePropertyTypes = async () => {
  const tiledProject: TiledProject = jsonDateParse(await readFile(filePath, "utf-8"));
  const classObjectTypes: string[] = [];

  for (const propertyType of tiledProject.propertyTypes)
    if (propertyType.type === PropertyType.class) {
      const { members, name, type } = propertyType;
      const objectPropertyFilename = `${name}ObjectProperty`;
      await Promise.all([
        outputFile(`${DIRECTORY}/${type}/${name}.ts`, generateClassString(name, members)),
        outputFile(
          `${DIRECTORY}/${type}/${objectPropertyFilename}.ts`,
          generateEnumString(
            objectPropertyFilename,
            members.map((m) => m.name),
          ),
        ),
      ]);
      classObjectTypes.push(name);
    } else {
      const { name, type, values } = propertyType;
      await outputFile(`${DIRECTORY}/${type}/${name}.ts`, generateEnumString(name, values));
    }

  const enumName = "ObjectType";
  await outputFile(`${DIRECTORY}/${PropertyType.class}/${enumName}.ts`, generateEnumString(enumName, classObjectTypes));
};
