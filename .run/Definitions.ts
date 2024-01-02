export interface XMLOptions {
  prettify_unpacked: boolean
  minify_repacked: boolean
}

export interface ConverterCommandTemplates {
  unpack: string[];
  pack: string[];
}

export interface Config {
  content_order: string[];
  converter: string;
  converter_command_templates: ConverterCommandTemplates;
  launcher: string;
  launcher_arguments: string;
  xml_options: XMLOptions;
}

export interface ConfigFull extends Config {
  i_verified_settings?: boolean;
}

export interface ProcessOutcome {
  code: number;
  message?: string;
}

export const OPTION_ALIASES = {
  "unpack": "unpack",
  "u": "unpack",
  "e": "unpack",
  "1": "unpack",

  "validate": "validate",
  "v": "validate",
  "c": "validate",
  "2": "validate",

  "repack": "repack",
  "r": "repack",
  "w": "repack",
  "3": "repack",

  "game": "game",
  "g": "game",
  "p": "game",
  "4": "game",

  "quit": "quit",
  "q": "quit",
  "x": "quit",
  "0": "quit",
};

export const TEXT_HELP = `
      [  T R U E    L O C A L I S A T I O N  ]

       (1) \x1b[1mU\x1b[0mnpack    —   extract DB archives
       (2) \x1b[1mV\x1b[0malidate  —   check your XML files
       (3) \x1b[1mR\x1b[0mepack    —   write DB archives

       (4) \x1b[1mG\x1b[0mame      —   play game
       (5) \x1b[1mH\x1b[0melp      —   show this page`;
