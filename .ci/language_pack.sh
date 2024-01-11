#!/bin/sh

LANG_FILE="./language_selector.json"
ARCHIVE_NAME_PREFIX=""
ARCHIVE_NAME_POSTFIX=""

rm -r ./tmp 2> /dev/null
rm -r ./output 2> /dev/null
mkdir ./tmp
mkdir ./output

for locale_code in $(jq -r  '.[] | keys[]' $LANG_FILE); do
  mkdir -p ./tmp/$locale_code/gamedata/configs/text 2> /dev/null || true

  printf "[string_table]\nlanguage        = ${locale_code}\nfont_prefix     = $(jq -r ".locales.${locale_code}.prefix" $LANG_FILE)" > ./tmp/$locale_code/gamedata/configs/localization.ltx

  cp -r ./gamedata/configs/ui ./tmp/$locale_code/gamedata/configs/ui
  cp -r ./gamedata/configs/text/$locale_code ./tmp/$locale_code/gamedata/configs/text/$locale_code
  rm ./tmp/$locale_code/gamedata/configs/text/$locale_code/.editorconfig

  # package dir into archive
  [ ! -z "${locale_code}" ] && 7z a ./output/${ARCHIVE_NAME_PREFIX}$(jq -r ".locales.${locale_code}.name" $LANG_FILE)${ARCHIVE_NAME_POSTFIX}.7z ./tmp/$locale_code/gamedata >/dev/null

  # remove "blank" locales (archives smaller than 7 kb)
  find ./output -type f -name "*.7z" -size -7k -delete
done
