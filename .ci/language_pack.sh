#!/bin/sh

LANG_FILE="./language_selector.json"
ARCHIVE_NAME_PREFIX=""
ARCHIVE_NAME_POSTFIX=""

rm -r ./tmp 2> /dev/null
rm -r ./releases 2> /dev/null
mkdir ./tmp
mkdir ./releases

for locale_code in $(jq -r  '.[] | keys[]' $LANG_FILE); do
  echo "Working with '$locale_code'"

  mkdir -p ./tmp/$locale_code/gamedata/configs/text/$locale_code 2> /dev/null || true

  printf "[string_table]\nlanguage        = ${locale_code}\nfont_prefix     = $(jq -r ".locales.${locale_code}.prefix" $LANG_FILE)" > ./tmp/$locale_code/gamedata/configs/localization.ltx

  cp -r ./gamedata_UTF-8/configs/ui ./tmp/$locale_code/gamedata/configs/ui

  find ./gamedata_UTF-8/configs/text/$locale_code -name "*.xml" -type f | while read file; do

    iconv -f utf-8 -t $(jq -r ".locales.${locale_code}.encoding" $LANG_FILE)//IGNORE $file > ./tmp/$locale_code/gamedata/configs/text/$locale_code/$(basename $file) 2> /dev/null || echo " $file"
  done

  # True Stalker credits file has cyrillic characters...
  iconv -f utf-8 -t windows-1251 ./gamedata_UTF-8/configs/text/$locale_code/st_ui_ts_credits.xml > ./tmp/$locale_code/gamedata/configs/text/$locale_code/st_ui_ts_credits.xml 2> /dev/null

  # package dir into archive
  [ ! -z "${locale_code}" ] && 7z a ./releases/${ARCHIVE_NAME_PREFIX}$(jq -r ".locales.${locale_code}.name" $LANG_FILE)${ARCHIVE_NAME_POSTFIX}.7z ./tmp/$locale_code/gamedata >/dev/null

  # remove "blank" locales (archives smaller than 7 kb)
  find ./releases -type f -name "*.7z" -size -7k -delete
done
