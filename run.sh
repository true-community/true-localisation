#!/bin/sh

case $1 in
  unpack | u)
    .dbtool/utils/db_unpack.sh resources
    .dbtool/utils/db_unpack.sh patches

    # .dbtool/utils/db_unpack.sh language
    ;;
  pack | p)
    .dbtool/utils/db_pack.sh resources
    .dbtool/utils/db_pack.sh patches

    # .dbtool/utils/db_pack.sh language
    ;;
  *)
    echo "  unpack - extract DB archives"
    echo "  pack - create DB archives"
    echo "  help - show this text"
    ;;
esac
