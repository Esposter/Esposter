import type { TiledProject } from "@@/scripts/tiled/models/TiledProject";

import { PropertyType } from "@/models/dungeons/tilemap/PropertyType";
import { outputFile } from "@@/scripts/services/outputFile";
import { TILED_ROOT_DIRECTORY, WORLD_ROOT_DIRECTORY } from "@@/scripts/tiled/constants";
import { PROPERTY_TYPES_DIRECTORY } from "@@/scripts/tiled/propertyTypes/constants";
import { createClassString } from "@@/scripts/tiled/propertyTypes/createClassString";
import { createEnumString } from "@@/scripts/util/createEnumString";
import { jsonDateParse } from "@esposter/shared";
import { readFile } from "node:fs/promises";

const FILE_PATH = `${WORLD_ROOT_DIRECTORY}/index.tiled-project`;

export const createPropertyTypes = async () => {
  const tiledProject: TiledProject = jsonDateParse(await readFile(FILE_PATH, "utf8"));
  const classObjectTypes: string[] = [];

  for (const propertyType of tiledProject.propertyTypes)
    if (propertyType.type === PropertyType.Class) {
      const { members, name, type } = propertyType;
      const objectPropertyFilename = `${name}ObjectProperty`;
      await Promise.all([
        outputFile(
          TILED_ROOT_DIRECTORY,
          `${PROPERTY_TYPES_DIRECTORY}/${type}/${name}.ts`,
          createClassString(name, members),
        ),
        outputFile(
          TILED_ROOT_DIRECTORY,
          `${PROPERTY_TYPES_DIRECTORY}/${type}/${objectPropertyFilename}.ts`,
          createEnumString(
            objectPropertyFilename,
            members.map(({ name: memberName }) => memberName),
          ),
        ),
      ]);
      classObjectTypes.push(name);
    } else {
      const { name, type, values } = propertyType;
      await outputFile(
        TILED_ROOT_DIRECTORY,
        `${PROPERTY_TYPES_DIRECTORY}/${type}/${name}.ts`,
        createEnumString(name, values),
      );
    }

  const enumName = "ObjectType";
  await outputFile(
    TILED_ROOT_DIRECTORY,
    `${PROPERTY_TYPES_DIRECTORY}/${PropertyType.Class}/${enumName}.ts`,
    createEnumString(enumName, classObjectTypes),
  );
};
