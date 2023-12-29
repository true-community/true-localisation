#!/bin/sh
# Requirements: xmllint, jq, tofrodos

content_type=$1
[ -z ${content_type} ] && exit 1
[ ! -f "./converter.exe" ] && exit 1
[ ! -d ".dbtool/extracted/${content_type}/" ] && exit 1

rm -r .dbtool/minified/${content_type}/* 2> /dev/null || mkdir -p .dbtool/minified/${content_type}/

for archive_name in $(ls -1v .dbtool/extracted/${content_type}/); do

  echo
  echo ${archive_name}

  # move files into the right archive
  for file in $(jq -r "to_entries[] | select(.value == \"${archive_name}\") | .key" .dbtool/extracted/${content_type}/.index.json); do
    # uglify
    direct_file=".dbtool/minified/${content_type}/${file}"
    mkdir -p $(dirname ${direct_file})
    cp gamedata/${file} ${direct_file}.tmp
    xmllint --noblanks ${direct_file}.tmp > ${direct_file} 2> /dev/null
    exit_code=$?
    if [ "$exit_code" -ne "0" ]; then
      rm ${file} 2> /dev/null
    else
      mkdir -p .dbtool/separated/${content_type}/${archive_name}/$(dirname ${file})
      cp ${direct_file} .dbtool/separated/${content_type}/${archive_name}/${file}
    fi

    rm ${direct_file}.tmp 2> /dev/null
  done

  find . -type f -name "*.xml" -print0 | xargs -0 todos

  if [ -d ".dbtool/separated/${content_type}/${archive_name}" ]; then
    # .dbtool/db_converter/build/src/db_converter --pack --xdb ${dir_name} --out ./content/${content_type}/$(basename ${dir_name})$(date +%s).db 2> /dev/null
    wine ./converter.exe -pack -xdb .dbtool/separated/${content_type}/${archive_name} -out ./content/${content_type}/$(basename $(echo ${archive_name} | sed "s/\./$(date +%s)\./")) #2> /dev/null
  fi
done
