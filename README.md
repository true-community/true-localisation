# true-localisation | [True Stalker](https://ap-pro.ru/forums/topic/102-true-stalker/)

![alt text](https://i.ibb.co/02mzMj2/62463b1abe776a3-1.png)

Current repository has XML files ready for translation in [English](https://github.com/lehrax-gaming/true-localisation/tree/main/gamedata/configs/text/eng), [French](https://github.com/lehrax-gaming/true-localisation/tree/main/gamedata/configs/text/fra), [German](https://github.com/lehrax-gaming/true-localisation/tree/main/gamedata/configs/text/ger), [Italian](https://github.com/lehrax-gaming/true-localisation/tree/main/gamedata/configs/text/ita), [Polish](https://github.com/lehrax-gaming/true-localisation/tree/main/gamedata/configs/text/pol), [Spanish](https://github.com/lehrax-gaming/true-localisation/tree/main/gamedata/configs/text/spa), [Ukrainian](https://github.com/lehrax-gaming/true-localisation/tree/main/gamedata/configs/text/ukr).

To suggest your own changes you can do one of the following:
- add comments to lines where you suggest to make edits
- fork and create PRs in your own repo
- request to be added as contributor


## Translation flow

1. Make edits in text strings
2. Test changes in game
3. Submit your changes via pull request

[!] Every XML file must start with `<?xml version="1.0" encoding="windows-1251"?>` line. The game engine does not support UTF-8 encoding!<br/>Although, latin letters would be displayed inentically for either one, accents and other non-[ASCII](https://en.wikipedia.org/wiki/ASCII) characters can and will not. Save your XMLs as [Windows-1251](https://en.wikipedia.org/wiki/Windows-1251).

You may use [HTML entities](https://www.w3schools.com/charsets/ref_html_entities_4.asp) for special characters, but <u>verify that they display correctly</u> before you submit changes. **Make sure to replace** `&` **with** `&amp;` **if you use ampersands!**


## Changing language

- If your language is already officially in the game, just switch to it from the menu.

- If not — set language code in your `userdata/user.ltx` file.<br/>
  For example, for German: `g_language rus` > `g_language ger`

<br/>

---

<br/>
<details><summary>[ <b>EXTRAS</b> / <i>for developers</i> ]</summary>

#### Requirements:

- [bun](https://bun.sh/docs/installation)

### Extract DB archives yourself

0. Make sure you have a suitable converter tool at hand (ex: [CoC DB converter](https://www.moddb.com/mods/call-of-chernobyl/downloads/cop-coc-db-converter)), place `converter.exe`<sup>1</sup> in this directory next to _README.md_ file
1. Find localisation DB file from content/resources directory
2. Run the `./run.ts unpack` to automagically extract from _db_ files

### Create DB archives yourself (WIP)

0. Make sure you have a suitable converter tool at hand (ex: [CoC DB converter](https://www.moddb.com/mods/call-of-chernobyl/downloads/cop-coc-db-converter)), place `converter.exe`<sup>1</sup> in this directory next to _README.md_ file
1. Create the DB files via `./run.ts pack`


### Settings

Here are [the default values](./settings.default.json) that you can change to suit your needs:

```json
{
  "content_order": [                // 1
    "resources",
    "language",
    "patches"
  ],
  "converter": "./converter.exe",   // 2
  "converter_command_templates": {  // 3
    "unpack": [
      "-unpack",
      "-xdb",
      "**PATH_INPUT**",
      "-dir",
      "**PATH_OUTPUT**"
    ],
    "pack": [
      "-pack",
      "-xdb",
      "**PATH_INPUT**",
      "-out",
      "**PATH_OUTPUT**"
    ]
  },
  "launcher": "./PlayGame.exe",     // 4
  "launcher_arguments": "",         // 5
  "xml_options": {                  // 6
    "prettify_unpacked": true,
    "minify_repacked": true
  },
  "i_verified_settings": false      // 7
}
```


1. Lower override higher, if files with same name are present in multiple archives (newer patches replace older files).
2. Executable that is used for conversion. __NOT__ provided here.
3. When my script invokes the converter call, this is the command
4. Executable that launcher the game.
5. CLI arguments to start launcher with.
6. Whether you want to process XML files or not (WIP)
7. A safety measure for you to check the settings once at least :)


---

<details><summary>Where I got the language strings from</summary><br/>

  I own the copy of S.T.A.L.K.E.R.: Call of Pripyat on Steam and it has `localization` directory in game files. In that directory you can find x{language}.db file (for language you chose for the game on Steam). So, in order to get all the official locales I switched between the languages and extracted the archives via converter.

  I used the same converter to extract language strings from True Stalker's `content/resources/xlocalization.db` file.

  ---

  (i) Alternative approach to extracting game files is by replacing `bin/xrAPI.dll` with modified library that dumps the game content while the game is running (Lua script injection).
</details>

### Help me improve the CLI extractor tool

Any [suggestion](https://github.com/lehrax-gaming/true-localisation/issues) is welcome, if you want to help me with the toolkit.

</details>
