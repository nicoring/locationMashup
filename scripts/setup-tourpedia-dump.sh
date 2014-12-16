curl 'http://tour-pedia.org/download/tourpedia.rdf' | sed -E -e 's/rdf:label/rdfs:label/g' > tourpedia.rdf
rapper -o turtle tourpedia.rdf | sed -Ee 's_(file:///data/d2rq-0.8.1/tourpedia.rdf#)_http://tour-pedia.org/resource/_g' > tourpedia.ttl | head -n 500
