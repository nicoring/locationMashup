var Sparqler = require('./sparqler');
var _ = require('lodash');

var wikivoyageEnpoint = 'http://localhost:10002/sparql';
var defaultGraph = "<http://localhost/wikivoyage>";

function WikivoyageSparqler() {
  Sparqler.call(this, wikivoyageEnpoint);
}

WikivoyageSparqler.prototype = _.create(Sparqler.prototype);

WikivoyageSparqler.prototype.getAllOfCategory = function(category, callback) {
  var query = 'SELECT ?label ?lat ?lng FROM $graph WHERE {' +
                '?s a $activity; ' +
                  'rdfs:label ?label; ' +
                  'geo:lat ?lat; ' +
                  'geo:long ?lng.}';
  

  var activity = "voyont:" + category.capitalize() + 'Activity'

  var _this = this;

  var sQuery = this.createQuery(query)
    .setParameter('activity', activity)
    .setParameter('graph', defaultGraph)
    .execute(function(body) {
      callback(_this.sparqlFlatten(body));
    });
}

module.exports = WikivoyageSparqler;
