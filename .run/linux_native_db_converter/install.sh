#!/bin/sh
# Installs db_converter
# Requirements: boost, spdlog, gtest, git

# git clone https://github.com/Masterkatze/db_converter.git 2> /dev/null || true

cd db_converter

mkdir build 2> /dev/null || true
cd build
cmake ..
make

chmod a+x ./src/db_converter
