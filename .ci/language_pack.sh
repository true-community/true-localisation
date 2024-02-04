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
    target_encoding=$(jq -r ".locales.${locale_code}.encoding" $LANG_FILE)

    echo $file
    iconv -sc -f utf-8 -t $target_encoding $file > ./tmp/$locale_code/gamedata/configs/text/$locale_code/$(basename $file)
    sed -i "1s/^/<?xml version=\"1.0\" encoding=\"$target_encoding\"?>\n/" ./tmp/$locale_code/gamedata/configs/text/$locale_code/$(basename $file)
  done

  # only build language packs for locales that have at least one XML file
  if [ "$(ls $(find ./tmp/$locale_code/gamedata/configs/text/$locale_code -type d) | wc -l)" -ne "0" ]; then
    mkdir -p ./tmp/$locale_code/gamedata/textures/fonts 2> /dev/null || true
    cp -r ./gamedata_UTF-8/textures/fonts ./tmp/$locale_code/gamedata/textures/fonts

    # package dir into archive
    [ ! -z "${locale_code}" ] && 7z a ./releases/${ARCHIVE_NAME_PREFIX}$(jq -r ".locales.${locale_code}.name" $LANG_FILE)${ARCHIVE_NAME_POSTFIX}.7z ./tmp/$locale_code/gamedata >/dev/null
  else
    echo "Skipping compilation: $locale_code"

    # create 0-byte placeholder
    # touch "./releases/${ARCHIVE_NAME_PREFIX}$(jq -r ".locales.${locale_code}.name" $LANG_FILE)${ARCHIVE_NAME_POSTFIX}.7z"
  fi
done
