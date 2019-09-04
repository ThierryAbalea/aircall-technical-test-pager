import { promises as fs } from "fs";

export async function findById<T>(path: string, id: string): Promise<T> {
  const objects = await findAll<T>(path);
  return objects[id];
}

export async function persist<T>(
  path: string,
  id: string,
  object: T,
): Promise<void> {
  const objects = await findAll<T>(path);
  objects[id] = object;
  return fs.writeFile(path, JSON.stringify(objects, null, 2));
}

async function findAll<T>(
  path: string,
): Promise<{
  [id: string]: T;
}> {
  try {
    const json = await fs.readFile(path, "utf8");
    return JSON.parse(json);
  } catch {
    return {};
  }
}
