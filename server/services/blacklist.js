
var _ = require('lodash');

/** SETUP BLACKLIST **/

var blacklist = require('../../data/blacklist');

/** HELPERS **/

function validateBlacklist() {
  blacklist = _.map(blacklist, function(entry) {
    return validateStringForBlacklist(entry);
  });
}

/**
 * Return true, if type is in entryTypes.
 * Consider no types as disabled type filtering.
 */
function containsType(entryTypes, type) {
  return entryTypes.length === 0 || !!_.find(entryTypes, type);
}

function validateStringForBlacklist(entry) {
  return entry.toLowerCase().trim();
}

/** EXPORTS **/

exports.contains = function(label, type) {

  var validated = validateStringForBlacklist(label),
      entry;

  for (var i = 0; i < blacklist.length; i++) {
    entry = blacklist[i];

    if (typeof entry === 'string') {
      entry = {
        label: entry,
        types: []
      };
    }

    if (!entry.types) {
      entry.types = [];
    }

    if (containsType(entry.types, type) && validated.contains(entry.label)) {
      return true;
    }
  }

  return false;

}

