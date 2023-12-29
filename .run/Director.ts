#!/usr/bin/bun



import { basename } from 'path';
import { readdirSync } from 'fs';

export const readDirectoryRecursively = (directoryPath: string) =>
  readdirSync(directoryPath, { recursive: true, withFileTypes: true }).filter(dirent => dirent.isFile()).map(dirent => dirent.name);


// INCOMPLETE! DO NOT USE
const listDirectoriesRecursively = (
  directoryPath: string,
  blacklist: string[] | undefined = undefined,
  includeHiddenFiles = false
): string[] => {
  let dirs: string[] = [];

  const set_blacklist = new Set(blacklist);

  const readDirectory = (path: string) => {
    try {
      const dirents = readdirSync(path, { withFileTypes: true });
      for (const dirent of dirents) {
        const resolvedPath = `${path}/${dirent.name}`.replaceAll('//', '/');
        if (!set_blacklist.has(resolvedPath)) {
          if (includeHiddenFiles ? true : !basename(resolvedPath).startsWith('.')) {
            if (dirent.isDirectory()) {
              dirs.push(resolvedPath);
              readDirectory(resolvedPath);
            }
          } else {
            // files.push(resolvedPath);
          }
        }
      }
    } catch (error) {
      if (error.code !== 'EACCES') {
        throw error; // re-throw the error if it's not a Permission Denied error
      }
      // Permission Denied error encountered, skip the directory
    }
  };

  readDirectory(directoryPath);
  return dirs;
};

const tree = () => {

};


if (import.meta.path !== Bun.main) {
  // This module is being imported into another script
  console.log('Director.listDirectoriesRecursively(dirname) [tree]');
} else {
  // This module is being directly executed as script
  const filelist = listDirectoriesRecursively('./', ['./.git', './db_converter', './gamedata', './node_modules', './unpacked', './userdata'], false);
  console.log(filelist);
}
