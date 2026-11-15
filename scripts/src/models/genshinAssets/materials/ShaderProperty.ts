// A property a shader declares: its name, its type and its flags, the gamma flag among them. The type is the code as
// The file holds it, a ShaderPropertyType's or one the tooling has not read, since a throw on an unknown code would abort
// Every material in the bank
export interface ShaderProperty {
  flags: number;
  name: string;
  type: number;
}
