/* oxlint-disable typescript/no-inferrable-types -- `isolatedDeclarations` demands every exported constant's annotation */
// The one user a development session route signs in, which the seed writes and the route reads, so both name it from
// This file. Its id is version-7 shaped, which `z.uuidv7()` accepts, and not the zero UUID, which the room's automod actor
// Holds, so the audit log never labels the driven user's own actions as AutoMod
export const DRIVEN_USER_ID: string = "00000000-0000-7000-8000-000000000001";
// The hostnames a development database or storage emulator can answer on from this machine. A URL's hostname keeps
// The brackets of an IPv6 literal, which is why the loopback address is spelled with them
export const LOCAL_HOSTNAMES: readonly string[] = ["[::1]", "127.0.0.1", "localhost"];
// The query parameters the postgres driver reads a host from ahead of the URL's own authority, so a loopback authority
// Carrying one of them connects to the host the parameter names
export const HOST_PARAMETER_NAMES: readonly string[] = ["host", "hostaddr"];
