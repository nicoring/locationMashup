var Sparqler = require('./sparqler');
var _ = require('lodash');

var dbpediaEnpoint = 'http://dbpedia.org/sparql';

function DBpediaSparqler() {
  Sparqler.call(this, dbpediaEnpoint);

  this.defaultGraph = '<http://dbpedia.org>';
}

DBpediaSparqler.prototype = _.create(Sparqler.prototype);


DBpediaSparqler.prototype.getWikipediaLink = function(uri, callback) {

  var query ='SELECT * FROM $graph WHERE {?wikipediaLink foaf:primaryTopic $uri}'
  uri = '<' + encodeURI(uri) + '>';

  var _this = this;
  this.createQuery(query)
    .setParameter('graph', this.defaultGraph)
    .setParameter('uri', uri)
    .execute(function(body) {
      console.log('body', body);
      body = _this.sparqlFlatten(body);
      var wikiLink = body.wikipediaLink;
      callback(wikiLink);
    });
}

module.exports = DBpediaSparqler;
