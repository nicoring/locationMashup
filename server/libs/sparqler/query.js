var _ = require('lodash');

/**
 * @param {Sparqler} sparqler
 * @param {String} query
 */
function SparqlerQuery(sparqler, query) {
  this.sparqler = sparqler;
  this.rawQuery = query || "";
  this.parameters = {};
}

SparqlerQuery.prototype.setParameter = function(key, value) {
  this.parameters[key] = value;

  return this;
};

SparqlerQuery.prototype.setParameters = function(parameters) {
  this.parameters = _.extend(this.parameters, parameters);

  return this;
};

SparqlerQuery.prototype.execute = function(callback) {
  if (typeof callback !== "function") {
    throw new Error("Provide a callback function!");
  }

  var query = this.parseParameters(this.rawQuery, this.parameters);
  this.sparqler.execute(query, callback);

  return this;
};

SparqlerQuery.prototype.parseParameters = function(query, parameters) {
  _.forEach(parameters, function(value, key) {
    var pattern = new RegExp("\\$" + key + "[\\s\\n\\r\\t]*", "g");
    query = query.replace(pattern, value + " ");
  });

  return query;
};

module.exports = SparqlerQuery;
