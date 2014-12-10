var Sparqler = require('./sparqler');
var _ = require('lodash');

var wikivoyageEnpoint = 'http://localhost:10002/sparql';

function WikivoyageSparqler() {
  Sparqler.call(this, wikivoyageEnpoint);

  this.defaultGraph = "<http://localhost/wikivoyage>";
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

  this.createQuery(query)
    .setParameter('activity', activity)
    .setParameter('graph', defaultGraph)
    .execute(function(body) {
      callback(_this.sparqlFlatten(body));
    });
}


WikivoyageSparqler.prototype.getDetailsByUri = function(uri, callback) {

  var query = 'SELECT ?label ?description FROM $graph WHERE { $uri dc:description ?description ; rdfs:label ?label . }'
  var uri = '<' + encodeURI(uri) + '>';

  var _this = this;
  this.createQuery(query)
    .setParameter('graph', this.defaultGraph)
    .setParameter('uri', uri)
    .execute(function(body) {
      callback(_this.sparqlFlatten(body));
    });
}
/**
* Get all resources inside a given rectangular bounding box
*
* @param {Object} bbox Boundingbox object, must contain: north, west, south, east
* @param {Function} callback Callback which is executed after the query
*/
WikivoyageSparqler.prototype.getResourcesInBBox = function(bbox, callback) {
  var query = "select * from $graph where { ?s geo:lat ?lat ; geo:long ?long ; rdfs:label ?label ; dbo:location ?location . filter ( ?lat < $north && ?lat > $south && ?long < $east && ?long > $west ) } ";
  var sQuery = this.createQuery(query);

  sQuery
  .setParameter("north", bbox.north)
  .setParameter("west", bbox.west)
  .setParameter("south", bbox.south)
  .setParameter("east", bbox.east)
  .setParameter("graph", this.defaultGraph)
  .execute(callback);
};


module.exports = WikivoyageSparqler;
