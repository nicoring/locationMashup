#! /bin/bash

set -e

usage="""
$0 graph path

graph - uri of graph
path - path to dataset directory
"""
# if [ $# -lt 1 ]; then
#   echo "$usage";
#   exit 1;
# fi

graph='http://localhost/wikivoyage/berlin'
path="./data/import"

if [ $# -gt 0 ]; then
  graph=$1
fi

if [ $# -gt 1 ]; then
  path=$2
fi


isql 10001 exec="ld_dir_all ('$path', '*', '$graph'); rdf_loader_run(); checkpoint;"
