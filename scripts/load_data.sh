#! /bin/bash
rm ./db/*
./scripts/virtuoso &

sleep 15

./scripts/load_graph.sh http://localhost/wikivoyage ./data/wikivoyage
./scripts/load_graph.sh http://localhost/tourpedia ./data/tourpedia_crawled
