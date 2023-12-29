#!/bin/sh

sudo apt-get install git tree -y

git clone https://github.com/Masterkatze/db_converter.git 2> /dev/null || true

mkdir -p ./content/resources ./content/languages ./content/patches
cp .run/linux_native_db_converter/settings.default.json ./settings.json

jq -c '.i_verified_settings = true' ./settings.json > ./settings.json.tmp && mv ./settings.json.tmp ./settings.json
jq -c '.converter = "./db_converter/build/src/db_converter"' ./settings.json > ./settings.json.tmp && mv ./settings.json.tmp ./settings.json

cat ./settings.json | jq

docker pull oven/bun:alpine
docker run --rm -v $(pwd):/app -v $(pwd)/content:/app/content oven/bun:alpine /bin/sh -c "apk add boost-dev build-base curl cmake gtest-dev spdlog-dev make && bun --version && cd /app && .run/linux_native_db_converter/install.sh && ls -l && bun install && bun ./run.ts validate && bun ./run.ts repack ''"

find ./content -type d -empty -delete
tree ./content
7z a ./content.7z ./content >/dev/null
stat -c %s ./content.7z | numfmt --to=iec-i --suffix=B --format="%.2f"
