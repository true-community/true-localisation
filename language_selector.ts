#!/usr/bin/bun
import { readFileSync, constants as fs_c } from "fs";
import inquirer from 'inquirer';
import { encode } from "iconv-lite";

const LOCALES_FILE = "./language_selector.json";

const optionalImport = async (moduleName: string) => {
  try {
    return await import(moduleName);
  } catch {
    return null;
  }
}

const main = () => {
  optionalImport(LOCALES_FILE).then(
    locales_map => {
      const locales = Object.keys(locales_map.locales).map(
        key => {
          const obj = locales_map.locales[key];
          return {
            name: obj.name,
            value: {
              font_prefix: obj.prefix,
              language: key
            }
          };
        }
      );
      const locale = "default";

      inquirer
        .prompt([
          {
            type: 'list',
            name: 'language',
            message: `True Stalker [${locale}]`,
            choices: locales
          }
        ])
        .then((answers) => {
          const result = answers.language;

          const filled_template = `[string_table]
language        = ${result.language}
font_prefix     = ${result.font_prefix}`;

          const encodedText = encode(filled_template, 'win1251');
          Bun.write('gamedata/configs/localization.ltx', encodedText);

          // TODO: also replace `g_language X` in user.ltx
        });
    }
  )
}

main();
