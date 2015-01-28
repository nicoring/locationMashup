var Sparqler = require('./sparqler');
var _ = require('lodash');

var tourpediaEnpoint = 'http://localhost:10002/sparql';


function TourpediaSparqler() {
  Sparqler.call(this, tourpediaEnpoint);

  this.classes = {
		"eat": "dbpedia-owl:Restaurant",
		"see": "travel:Sightseeing",
		"acco": "acco:Accommodation",
		"hAcco": "h:Accommodation",
		"buy": "gr:ProductOrService",
		"do": "h:PointsOfInterest"
	};

  this.base = 'http://tour-pedia.org/resource/';
  this.defaultGraph = "<http://localhost/tourpedia>";
}

TourpediaSparqler.prototype = _.create(Sparqler.prototype);

TourpediaSparqler.prototype.createUriFromId = function(id) {
  return '<' + this.base + id + '>'
};

TourpediaSparqler.prototype.getAllOverview = function(callback) {

  var queryString = "SELECT DISTINCT * FROM $graph WHERE {?s dbpedia-owl:location dbpedia:Berlin ;" +
                    "vcard:latitude ?lat ; vcard:longitude ?lng ; rdfs:label ?label . }"

	var _this = this;

	var sQuery = this.createQuery(queryString)
		.setParameter('graph', this.defaultGraph)
	  .execute(function(body) {
      body = _this.sparqlFlatten(body);
	    callback(body);
    });
}

TourpediaSparqler.prototype.getAllOverviewOfClass = function(tClass, callback) {
	tClass = this.classes[tClass];

	var queryString = "SELECT DISTINCT * FROM $graph WHERE {?s dbpedia-owl:location dbpedia:Berlin ; a $class; " +
                    "vcard:latitude ?lat ; vcard:longitude ?lng ; rdf:label ?label . }"

	var _this = this;

	var sQuery = this.createQuery(queryString)
    .setParameter('class', tClass)
    .setParameter('graph', this.defaultGraph)
	  .execute(function(body) {
	    callback(_this.sparqlFlatten(body));
    });
};

TourpediaSparqler.prototype.getPlaceById = function(id, callback) {
  var resource = this.createUriFromId(id);

  var query = 'SELECT * FROM $graph WHERE { ' +
                '{ $resource a ?type. } UNION ' +
                '{ $resource rdf:label ?label. } UNION ' +
                '{ $resource dbpedia-owl:address ?address. } UNION ' +
                '{ $resource vcard:hasTelephone ?phone. } UNION ' +
                '{ $resource foaf:primaryTopic ?primaryTopic. } UNION ' +
                '{ $resource dbpedia-owl:wikiPageExternalLink ?wikiLink. } UNION ' +
                '{ $resource rdfs:label ?rdfsLabel. } UNION ' +
                '{ $resource vcard:fn ?fn. } UNION ' +
                '{ $resource vcard:hasUrl ?url. } UNION ' +
                '{ $resource vcard:latitude ?lat. } UNION ' +
                '{ $resource vcard:longitude ?lng. }' +
              '}';

  var _this = this;

  this.createQuery(query)
    .setParameter('graph', this.defaultGraph)
    .setParameter('resource', resource)
    .execute(function(result) {
      result = _this.sparqlFlatten(result);
      result = _.reduce(result, _.assign, {});
      callback(result);
    });
};


/**
* Get all resources inside a given rectangular bounding box
*
* @param {Object} bbox Boundingbox object, must contain: north, west, south, east
* @param {Function} callback Callback which is executed after the query
*/
TourpediaSparqler.prototype.getResourcesInBBox = function(bbox, callback) {
  var query = "select * from $graph where { ?s a ?type; vcard:latitude ?lat ; vcard:longitude ?lng ; rdfs:label ?label . filter ( ?lat < $north && ?lat > $south && ?lng < $east && ?lng > $west ) } ";
  var sQuery = this.createQuery(query);

  sQuery
    .setParameter("north", bbox.north)
    .setParameter("west", bbox.west)
    .setParameter("south", bbox.south)
    .setParameter("east", bbox.east)
    .setParameter("graph", this.defaultGraph)
    .execute(callback);
};


/**
* Get all resources of a gicen category inside a given rectangular bounding box
*
* @param {Object} bbox Boundingbox object, must contain: north, west, south, east
* @param {String} category tourpedia category based on `this.classes`, sleep maps on acco and hAcco
* @param {Function} callback Callback which is executed after the query
*/
TourpediaSparqler.prototype.getResourcesOfCategoryInBBox = function(bbox, category, callback) {
  var query = "select * from $graph where { ?s a $type; a ?type; vcard:latitude ?lat ; vcard:longitude ?lng ; rdfs:label ?label . filter ( ?lat < $north && ?lat > $south && ?lng < $east && ?lng > $west ) } ";
  var sQuery = this.createQuery(query);


  sQuery
    .setParameter("type", this.classes[category])
    .setParameter("north", bbox.north)
    .setParameter("west", bbox.west)
    .setParameter("south", bbox.south)
    .setParameter("east", bbox.east)
    .setParameter("graph", this.defaultGraph)
    .execute(callback);
};



module.exports = TourpediaSparqler;
