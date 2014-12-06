var Sparqler = require('./sparqler');
var _ = require('lodash');

var tourpediaEnpoint = 'http://tour-pedia.org/sparql';
var defaultGraph = "http://localhost/tourpedia";

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
}

TourpediaSparqler.prototype = _.create(Sparqler.prototype);

TourpediaSparqler.prototype.getAllOverview = function(callback) {
var queryString = "SELECT DISTINCT * FROM $graph WHERE {?s dbpedia-owl:location dbpedia:Berlin ;" +
			  			"vcard:latitude ?lat ; vcard:longitude ?lng ; rdf:label ?label . }"

var _this = this;

var sQuery = this.createQuery(queryString)
	.setParameter('graph', defaultGraph)
    .execute(function(body) {
      callback(_this.sparqlFlatten(body));
 	});
}

TourpediaSparqler.prototype.getAllOverviewOfClass = function(tClass, callback) {
	tClass = this.classes[tClass];

	var queryString = "SELECT DISTINCT * FROM $graph WHERE {?s dbpedia-owl:location dbpedia:Berlin ; a $class; " +
				  			"vcard:latitude ?lat ; vcard:longitude ?lng ; rdf:label ?label . }"

	var _this = this;

	var sQuery = this.createQuery(queryString)
    	.setParameter('class', tClass)
    	.setParameter('graph', defaultGraph)
	    .execute(function(body) {
	      callback(_this.sparqlFlatten(body));
	 	});
};

module.exports = TourpediaSparqler;
