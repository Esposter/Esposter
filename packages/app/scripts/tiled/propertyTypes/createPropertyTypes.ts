import type { TiledProject } from "@@/scripts/tiled/models/TiledProject";

import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { PropertyType } from "@/models/dungeons/tilemap/PropertyType";
import { WORLD_ROOT_DIRECTORY } from "@@/scripts/tiled/constants";
import { DIRECTORY } from "@@/scripts/tiled/propertyTypes/constants";
import { createClassString } from "@@/scripts/tiled/propertyTypes/createClassString";
import { outputFile } from "@@/scripts/tiled/util/outputFile";
import { createEnumString } from "@@/scripts/util/createEnumString";
import { readFile } from "node:fs/promises";

const filePath = `${WORLD_ROOT_DIRECTORY}/index.tiled-project`;

export const createPropertyTypes = async () => {
  const tiledProject: TiledProject = jsonDateParse(await readFile(filePath, "utf-8"));
  const classObjectTypes: string[] = [];

  for (const propertyType of tiledProject.propertyTypes)
    if (propertyType.type === PropertyType.class) {
      const { members, name, type } = propertyType;
      const objectPropertyFilename = `${name}ObjectProperty`;
      await Promise.all([
        outputFile(`${DIRECTORY}/${type}/${name}.ts`, createClassString(name, members)),
        outputFile(
          `${DIRECTORY}/${type}/${objectPropertyFilename}.ts`,
          createEnumString(
            objectPropertyFilename,
            members.map(({ name }) => name),
          ),
        ),
      ]);
      classObjectTypes.push(name);
    } else {
      const { name, type, values } = propertyType;
      await outputFile(`${DIRECTORY}/${type}/${name}.ts`, createEnumString(name, values));
    }

  const enumName = "ObjectType";
  await outputFile(`${DIRECTORY}/${PropertyType.class}/${enumName}.ts`, createEnumString(enumName, classObjectTypes));
};
