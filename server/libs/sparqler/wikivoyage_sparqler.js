var Sparqler = require('./sparqler');
var _ = require('lodash');
var sparqlConfig = require('../../config');
var wikivoyageEnpoint = sparqlConfig.virtuoso_url;

function WikivoyageSparqler() {
  Sparqler.call(this, wikivoyageEnpoint);

  this.defaultGraph = "<"+sparqlConfig.wikivoyage_graph+">";
  this.base = sparqlConfig.wikivoyage_graph;
}

WikivoyageSparqler.prototype = _.create(Sparqler.prototype);


WikivoyageSparqler.prototype.createUriFromName = function(name) {
  return '<' + this.base + name + '>'
};

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
    .setParameter('graph', this.defaultGraph)
    .execute(function(body) {
      callback(_this.sparqlFlatten(body));
    });
}

/**
 *
 */
WikivoyageSparqler.prototype.getLocationDetailsByUri = function(uri, callback) {

  var query = 'SELECT * FROM $graph WHERE { {$uri dcterms:description ?description ; rdfs:label ?label} UNION {$uri owl:sameAs ?dbpediaUri} }';
  uri = '<' + encodeURI(uri) + '>';

  var _this = this;
  this.createQuery(query)
    .setParameter('graph', this.defaultGraph)
    .setParameter('uri', uri)
    .execute(function(body) {
      var result = _this.sparqlFlatten(body);
      result = _.reduce(result, _.assign, {});
      callback(result);
    });
}


/**
* Get all resources inside a given rectangular bounding box
*
* @param {Object} bbox Boundingbox object, must contain: north, west, south, east
* @param {Function} callback Callback which is executed after the query
*/
// TODO: long to lng
WikivoyageSparqler.prototype.getResourcesInBBox = function(bbox, callback) {
  var query = "select * from $graph where { ?s a ?type; geo:lat ?lat ; geo:long ?long ; rdfs:label ?label ; dbo:location ?location ; dcterms:description ?description. filter ( ?lat < $north && ?lat > $south && ?long < $east && ?long > $west ) } ";
  var sQuery = this.createQuery(query);

  sQuery
  .setParameter("north", bbox.north)
  .setParameter("west", bbox.west)
  .setParameter("south", bbox.south)
  .setParameter("east", bbox.east)
  .setParameter("graph", this.defaultGraph)
  .execute(callback);
};


WikivoyageSparqler.prototype.getResourceById = function(name, callback) {
  var resource = this.createUriFromName(name);
  var query = "select * from $graph where { $resource ?p ?o}";

  var sQuery = this.createQuery(query)
    .setParameter("graph", this.defaultGraph)
    .setParameter("resource", resource)
    .execute(callback);
};


module.exports = WikivoyageSparqler;
