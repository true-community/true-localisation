#!/usr/bin/bun

import { BunFile } from "bun";
import { copyFile, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFile } from "fs";
import { dirname } from "path";

import { readDirectoryRecursively } from "./Director";

// import * as parser from "fast-xml-parser";
// import * as chardet from 'chardet';

import { ConverterCommandTemplates, ProcessOutcome, XMLOptions } from "./Definitions";



const listMap = (array: string[], parent_key: string) =>
  Object.fromEntries(new Map(array.map(e => [e, parent_key])));

export default class Converter {
  converter: BunFile;
  converter_command_templates: ConverterCommandTemplates;
  order: string[];
  xml_options: XMLOptions;

  constructor (
    executable: BunFile,
    templates: ConverterCommandTemplates,
    order: string[],
    options: XMLOptions,
  ){
    this.converter = executable;
    this.converter_command_templates = templates;
    this.order = order;
    this.xml_options = options;
  }

  converterCommand (template: string[], path_input: string, path_output: string) {
    return [this.converter.name].concat(
      template.map(
        cmd_param => {
          if (cmd_param === '**PATH_INPUT**') return path_input;
          if (cmd_param === '**PATH_OUTPUT**') return path_output;
          return cmd_param;
        }
      )
    );
  }

  populate () {
    const file_list = readFileSync("gamedata/.index.json", 'utf8');

    const index = JSON.parse(file_list);
    Object.entries(index).forEach(
      k => {
        console.log(`.db/unpacked/${k[1]}/${k[0]} >> gamedata/${k[0]}`);

        mkdirSync(dirname(`gamedata/${k[0]}`), { recursive: true });
        copyFile(`.db/unpacked/${k[1]}/${k[0]}`, `gamedata/${k[0]}`, (_) => {});
      }
    );
    return {code: 0} as ProcessOutcome;
  }

  setup () {
    const paths = this.order.map(ct => `.db/unpacked/.${ct}.index.json`);

    const mergedJson = {};
    for (const filePath of paths) {
      const fileContent = readFileSync(filePath, 'utf8');
      const jsonContent = JSON.parse(fileContent);
      Object.assign(mergedJson, jsonContent);
    }

    Bun.write(
      "gamedata/.index.json",
      JSON.stringify(mergedJson, null, 2)
    );

    return {code: 0} as ProcessOutcome;
  }

  processXmlsAfterUnpacking () {  // pretty-print XMLs in gamedata
    if (this.xml_options.prettify_unpacked) {
      const options = {
        attributeNamePrefix: '',
        ignoreAttributes: false,
        cdataTagName: '__cdata',
        cdataPositionChar: '\\c',
        format: true,
        indentBy: '  ',
        supressEmptyNode: false,
      };
    }

    // const xml_file_path = "kjhkjhk.xml";
    // const data = readFileSync(xml_file_path, { encoding: 'win1251' });

    return {code: 0} as ProcessOutcome;
  }

  processXmlsDuringGamedataEditing () {  // validate encodings in gamedata
    // const file_name = 'sdfsdfsdf.xml';
    // const encoding = chardet.detectFileSync(file_name);
    // if (encoding[0].name !== 'windows-1251') console.log("Uncertain about encoding:", file_name)

    return {code: 0} as ProcessOutcome;
  }

  processXmlsBeforeRepacking () {  // minify XMLs before DB creation
    if (this.xml_options.minify_repacked) {
      const options = {
        attributeNamePrefix: '',
        ignoreAttributes: false,
        cdataTagName: '__cdata',
        cdataPositionChar: '\\c',
        format: false,
        indentBy: 0,
        supressEmptyNode: false,
      };

      // const jsonObj = parser.parse(xmlData, options);
      // const minifiedXml = parser.build(jsonObj, options);
    }

    return {code: 0} as ProcessOutcome;
  }

  extract (content_type: string) {
    const path_for_unpacked = `.db/unpacked/${content_type}`;
    existsSync(path_for_unpacked) && rmSync(path_for_unpacked, { recursive: true, force: true });
    mkdirSync(path_for_unpacked, { recursive: true });

    const contentPath = `content/${content_type}`;
    const files = readdirSync(contentPath);

    Bun.write(`.db/unpacked/.${content_type}.index.json`, "{}");

    files.filter(archive_name => /\.\w?db\w?\w?/.test(archive_name)).forEach(async archive_name => {
      const command_line = this.converterCommand(
        this.converter_command_templates.unpack,
        `content/${content_type}/${archive_name}`,
        `${path_for_unpacked}/${archive_name}`
      );
      console.log(command_line.join(' '));

      try {
        Bun.spawnSync(
          command_line
          /*[
            this.converter.name,
            "-unpack",
            "-xdb",
            `content/${content_type}/${archive_name}`,
            "-dir",
            `${path_for_unpacked}/${archive_name}`
          ]*/
        );
      } catch {
        return {
          code: 1,
          message: "\x1b[31mConverter is not available! \x1b[0m Path:" + this.converter.name
        } as ProcessOutcome;
      }

      console.log(archive_name);

      const index = readDirectoryRecursively(`${path_for_unpacked}/${archive_name}`);

      if (index.length > 0) {
        const current_index_list_map = listMap(index, `${content_type}/${archive_name}`);
        writeFile(
          `${path_for_unpacked}/.${archive_name}.index.json`,
          JSON.stringify(current_index_list_map, null, 2),
          (_) => {}
        );

        const content_type_index = JSON.parse(await Bun.file(`.db/unpacked/.${content_type}.index.json`).text());

        const new_content_type_index = JSON.stringify(Object.assign({}, content_type_index, current_index_list_map), null, 2);

        Bun.write(`.db/unpacked/.${content_type}.index.json`, new_content_type_index);
      } else {
        rmSync(`${path_for_unpacked}/${archive_name}`, { recursive: true, force: true })
      }
    });
    return {code: 0} as ProcessOutcome;
  }

  validate () {
    return {code: 0} as ProcessOutcome;
  }

  prepare () {
    const file_index = readFileSync('gamedata/.index.json', 'utf8');
    // console.log(JSON.parse(file_index));
    Object.entries(JSON.parse(file_index)).forEach(
      k => {
        // console.log(`gamedata/${k[0]} >> .db/repacked/${k[1]}/${k[0]}`);

        mkdirSync(dirname(`.db/repacked/${k[1]}/${k[0]}`), { recursive: true });

        copyFile(`gamedata/${k[0]}`, `.db/repacked/${k[1]}/${k[0]}`, (_) => {
          return {code: 1, message: "Unable to copy file:" + `gamedata/${k[0]}`}
        });
      }
    );

    return {
      code: 0
    } as ProcessOutcome;
  }

  archive (parameters: string[]) {
    const postfixIsInvalid = (str: string) => {
      const POSTFIX_PROHIBITED_CHARACTERS = new RegExp(`[\\\\/:*?"<>|]`);
      return POSTFIX_PROHIBITED_CHARACTERS.test(str);
    }

    const postfix = parameters[0] ?? `D${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}`;

    if (postfixIsInvalid(postfix)) {
      return {
        code: 1,
        message: "Invalid postfix value: " + postfix
      } as ProcessOutcome;
    }

    console.log();
    if (postfix === '') {
      console.log('New archives are created without postfix!');
    } else {
      console.log('Postfix for new files:', postfix);
    }

    const file_index = readFileSync('gamedata/.index.json', 'utf8');
    const archive_mentions = Object.values(JSON.parse(file_index));
    const archive_list = new Set(archive_mentions);

    archive_list.forEach(
      (archive_name: string) => {
        const new_archive_path = `content/${archive_name.replace('.db', postfix)}.db`

        const command_line = this.converterCommand(
          this.converter_command_templates.pack,
          `.db/repacked/${archive_name}`,
          new_archive_path
        );
        console.log(command_line.join(' '));

        // TODO: create target directories instead of naively expecting them to be present
        try {
          Bun.spawnSync(
            command_line
            /*[
              this.converter.name,
              "-pack",
              "-xdb",
              `.db/repacked/${archive_name}`,
              "-out",
              new_archive_path
            ]*/
          );
          console.log(new_archive_path);
        } catch {
          return {
            code: 1,
            message: "\x1b[31mConverter is not available! \x1b[0m Path:" + this.converter.name
          } as ProcessOutcome;
        }
      }
    );

    return {
      code: 0
    } as ProcessOutcome;
  }
}
