#!/usr/bin/bun

import { copyFileSync, constants as fs_c } from "fs";
import Converter from "./.run/Converter";

import { Config, ConfigFull, OPTION_ALIASES, ProcessOutcome, TEXT_HELP } from "./.run/Definitions";

var pkg = require("./package.json");

const SETTINGS_FILE = "./settings.json";

const optionalImport = async (moduleName: string) => {
  try {
    return await import(moduleName);
  } catch {
    return null;
  }
}

const menu = (config: Config, first_run = false) => {
  console.clear();

  const conv = new Converter(
    Bun.file(config.converter),
    config.converter_command_templates,
    config.content_order,
    config.xml_options
  );
  const args = Bun.argv;

  const TEXT_FOOTER = `${pkg.name} ${pkg.version ? ("v" + pkg.version) : ""}
${pkg.description}
---
${pkg.author}, ${pkg.years}`;

  let option = args[2];
  let exit_after_command = !!option;
  let result: ProcessOutcome = { code: 0 };

  while (true) {
    // if (option in OPTION_ALIASES)
    option = OPTION_ALIASES[option];
    if (option) console.log('[ INFO ]', option);

    switch (first_run ? "help" : option) {
      case 'unpack':
        Bun.write("gamedata/.index.json", "{}");

        for (let ct of config.content_order) {
          if (result.code === 0) result = conv.extract(ct);
        }
        if (result.code === 0) result = conv.setup();
        if (result.code === 0) result = conv.populate();
        if (result.code === 0) result = conv.processXmlsAfterUnpacking();
        break;

      case 'validate':
        result = conv.processXmlsDuringGamedataEditing();
        break;

      case 'repack':
        result = conv.prepare();
        if (result.code === 0) result = conv.processXmlsBeforeRepacking();
        if (result.code === 0) result = conv.archive(args.slice(3));
        break;

      case 'game':
        Bun.spawnSync([config.launcher, config.launcher_arguments]);
        break;

      case 'quit':
        exit_after_command = true;
        break;

      default:
        console.log(TEXT_HELP);
        // console.log();

        // exit if invalid option was passed through CLI
        // display menu otherwise
        option = args[2] ? 'quit' : undefined;
    }

    if (option) {
      if (option !== 'quit') {
        console.log(`[ ${result.code === 0 ? 'DONE' : 'FAIL'} ] ${option}${result.message ? `: ${result.message}` : ''}\n`);
      }

      if (exit_after_command) {
        console.log(TEXT_FOOTER);
        process.exit(0);
      }

      prompt("[ Press any key to continue ]");
      option = undefined;
    } else {
      console.log(`
       (0) \x1b[1mQ\x1b[0muit      —   take a break`);
      option = (prompt("\nOption:") || "h").toLowerCase();
    }

    console.clear();
  }
}

const setDefaults = () => {
  copyFileSync(
    "./settings.default.json",
    "./settings.json",
    fs_c.COPYFILE_FICLONE_FORCE
  )
};

const confirmSettings = async (config: ConfigFull) => {
  // const data = JSON.parse(await Bun.file(SETTINGS_FILE).text());
  const { i_verified_settings, ...data_displayed } = config;

  console.log("\nNew configuration detected:");

  delete data_displayed['default'];

  console.log(data_displayed)

  const answer = (prompt("Continue with these settings? yes/[no]: ") || "n").toLowerCase();
  if (answer === "yes" || answer === "y") {
    const data_written: ConfigFull = data_displayed;
    data_written.i_verified_settings = true;
    Bun.write(SETTINGS_FILE, JSON.stringify(data_written, null, 2));
    menu(config, true);
  } else {
    process.exit(1);
  }
};

const main = () => {
  optionalImport(SETTINGS_FILE).then(
    config => {
      const config_full = config as ConfigFull;
      if (config_full) {
        config_full.i_verified_settings
          ? menu(config as Config)
          : confirmSettings(config_full);
      } else {
        console.log("\nNo configuration detected.")
        setDefaults();
        console.log(
          "Default template applied:\x1b[31m",
          SETTINGS_FILE,
          "\x1b[0m\nYou can customise it whenever you like.\n"
        );
        prompt("[ Press any key to restart ]");
        console.clear();
        main();
      }
    }
  );
};

main();
