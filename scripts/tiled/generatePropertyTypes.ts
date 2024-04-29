import type { TiledObjectProperty } from "@/models/dungeons/tilemap/TiledObjectProperty";
import { outputFile, remove } from "fs-extra/esm";
import { readFile } from "node:fs/promises";

enum PropertyType {
  class = "class",
  enum = "enum",
}

interface ClassPropertyType {
  id: number;
  name: string;
  type: PropertyType.class;
  color: string;
  drawFill: boolean;
  members: TiledObjectProperty<unknown>[];
  useAs: string[];
}

interface EnumPropertyType {
  id: number;
  name: string;
  type: PropertyType.enum;
  storageType: string;
  values: string[];
  valuesAsFlags: boolean;
}

type PropertyTypes = (ClassPropertyType | EnumPropertyType)[];

const tiledProject = JSON.parse(await readFile("assets/dungeons/world/home/home.tiled-project", "utf-8"));
const directory = "generated/tiled/propertyTypes";
const classObjectTypes: string[] = [];

const getEnumString = (name: string, members: string[]) =>
  members.length === 0
    ? `export enum ${name} {}\n`
    : [`export enum ${name} {`, members.map((m) => `  ${m} = "${m}",`).join("\n"), "}\n"].join("\n");

await remove(directory);

for (const propertyType of tiledProject.propertyTypes as PropertyTypes)
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

await outputFile(`${directory}/${PropertyType.class}/ObjectType.ts`, getEnumString("ObjectType", classObjectTypes));
