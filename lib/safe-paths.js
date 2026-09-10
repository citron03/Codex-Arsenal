import { lstat } from "node:fs/promises";
import path from "node:path";

/**
 * Resolve `target` under `root` and refuse anything that lands outside it.
 *
 * The check is lexical: `path.resolve` normalises the string but does not
 * resolve symbolic links, so a contained path can still point elsewhere on
 * disk. Pair it with `assertNotSymlink` before writing.
 */
export function resolveContainedPath(root, target, message = "Destination escapes target directory") {
  const resolvedRoot = path.resolve(root);
  const destination = path.resolve(resolvedRoot, target);
  const relative = path.relative(resolvedRoot, destination);

  // `isAbsolute` is what catches a different drive on Windows, where
  // `path.relative` returns an absolute path rather than one starting with "..".
  if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`${message}: ${target}`);
  }

  return destination;
}

/**
 * Whether anything occupies `target`, symbolic links included.
 *
 * Uses `lstat` rather than `access` so a link pointing at a missing file counts
 * as occupied. Treating it as free would mean writing through the link and
 * creating the file it points at.
 */
export async function pathExists(target) {
  try {
    await lstat(target);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

/**
 * Refuse to write to a path that is a symbolic link.
 *
 * Containment above is lexical, so without this a link planted at an allowed
 * destination redirects the write anywhere the process can reach.
 */
export async function assertNotSymlink(destination) {
  let stats;

  try {
    stats = await lstat(destination);
  } catch (error) {
    if (error.code === "ENOENT") {
      return;
    }
    throw error;
  }

  if (stats.isSymbolicLink()) {
    throw new Error(`Refusing to write through a symbolic link: ${destination}`);
  }
}
