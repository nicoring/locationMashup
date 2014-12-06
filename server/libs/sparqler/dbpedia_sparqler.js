var Sparqler = require('./sparqler');
var _ = require('lodash');

var dbpediaEnpoint = 'http://dbpedia.org/sparql';

function DBpediaSparqler() {
  Sparqler.call(this, dbpediaEnpoint);
}

DBpediaSparqler.prototype = _.create(Sparqler.prototype);

module.exports = DBpediaSparqler;
