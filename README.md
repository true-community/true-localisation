# true-localisation | [True Stalker](https://ap-pro.ru/forums/topic/102-true-stalker/)

![alt text](https://i.ibb.co/02mzMj2/62463b1abe776a3-1.png)

Current repository has extracted XML files ready for translation in [gamedata/configs/text](https://github.com/lehrax-gaming/true-localisation/tree/main/gamedata/configs/text) directory.

## Translation flow

1. Make edits in text strings
2. Test changes in game
3. Submit your changes via pull request

---

### (optionally) Extract DB entries yourself

0. Make sure you have a suitable converter tool at hand (ex: [CoC DB converter](https://www.moddb.com/mods/call-of-chernobyl/downloads/cop-coc-db-converter)), place `converter.exe` in this directory next to _README.md_ file
1. Find localisation DB file from content/resources directory
2. Run the `./run.sh unpack` to extract strings automagically on Linux or via a manual command on Windows (`converter.exe -unpack -xdb .\content\resources\xlocalization.db -dir .\gamedata`)

### (optionally) Create DB files yourself [**WIP!**]

0. Make sure you have a suitable converter tool at hand (ex: [CoC DB converter](https://www.moddb.com/mods/call-of-chernobyl/downloads/cop-coc-db-converter)), place `converter.exe` in this directory next to _README.md_ file
1. Create the DB files via `./run.sh pack` on Linux or by running converter directly on Windows
