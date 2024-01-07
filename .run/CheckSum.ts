#!/usr/bin/bun

import { readFile } from 'fs/promises';

export const getFileWyhash = async (file_path: string) => {
  const fileBuffer = await readFile(file_path);
  const wyhash = Bun.hash.wyhash(fileBuffer);
  return wyhash;
};

if (import.meta.path !== Bun.main) {
  // This module is being imported into another script
  console.log('CheckSum.getFileWyHash(file) [wyhash]');
} else {
  // This module is being directly executed as script
  // Usage example:
  const filePath = Bun.argv[1] ?? Bun.argv[0];
  getFileWyhash(filePath).then(wyhash => {
    console.log('The wyhash of', filePath, 'is', wyhash);
  });
}
