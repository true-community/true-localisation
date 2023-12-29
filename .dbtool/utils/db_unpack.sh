#!/bin/sh
# Unpacks all db files present in content/${content_type} directory
# Requirements: xmllint, jq, tofrodos

content_type=$1
[ -z ${content_type} ] && exit 1

rm -r .dbtool/extracted/${content_type}/* 2> /dev/null || mkdir -p .dbtool/extracted/${content_type}/

echo "{}" > .dbtool/extracted/${content_type}/.index.json

for archive_dir in $(ls -1v ./content/${content_type}/); do
  file="./content/${content_type}/${archive_dir}"

  echo
  echo "${archive_dir}"

  # .dbtool/db_converter/build/src/db_converter --unpack --xdb ${file} --out ./.dbtool/extracted/${archive_dir} 2> /dev/null
  wine ./converter.exe -unpack -xdb ${file} -dir .dbtool/extracted/${content_type}/${archive_dir} #2> /dev/null

  echo "{ " > .dbtool/extracted/${content_type}/${archive_dir}.json
  for direct_file in `echo $(cd .dbtool/extracted/${content_type}/${archive_dir}; find ./ -type f)`; do
    if [ -s ".dbtool/extracted/${content_type}/${archive_dir}/${direct_file}" ]; then
      echo "  \"${direct_file}\": \"${archive_dir}\"", >> .dbtool/extracted/${content_type}/${archive_dir}.json
    else
      # remove blank files
      rm ".dbtool/extracted/${content_type}/${archive_dir}/${direct_file}"
    fi
  done
  truncate -s-2 .dbtool/extracted/${content_type}/${archive_dir}.json
  echo "" >> .dbtool/extracted/${content_type}/${archive_dir}.json
  echo "}" >> .dbtool/extracted/${content_type}/${archive_dir}.json

  cp -r .dbtool/extracted/${content_type}/${archive_dir}/* ./gamedata/ 2> /dev/null

  mv .dbtool/extracted/${content_type}/.index.json .dbtool/extracted/${content_type}/.index.json.tmp
  jq -s 'add' .dbtool/extracted/${content_type}/.index.json.tmp .dbtool/extracted/${content_type}/${archive_dir}.json > .dbtool/extracted/${content_type}/.index.json
done

find . -type f -name "*.xml" -print0 | xargs -0 todos

if $(jq -e '. == {}' .dbtool/extracted/${content_type}/.index.json); then
  rm -r .dbtool/extracted/${content_type}
else
  for file in `echo $(find ./gamedata -name "*.xml" -type f)`; do
    # prettify
    mv ${file} ${file}.tmp
    # xmllint --format --recover ${file}.tmp > ${file} #2> /dev/null

    # sed -E 's/(&[^#]|[^&])/\1amp;/g' <filename> # maybe?
    sed 's/&/\&amp;/g' ${file}.tmp | xmllint --format - > ${file} #2> /dev/null
    exit_code=$?
    if [ "$exit_code" -ne "0" ]; then
      echo ${file}
      rm ${file}
    fi
    rm ${file}.tmp
  done
fi
