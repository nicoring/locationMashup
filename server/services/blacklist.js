
var _ = require('lodash');

/** SETUP BLACKLIST **/

var blacklist = require('../../data/blacklist');
// validateBlacklist();


/** HELPERS **/

function validateBlacklist() {
  blacklist = _.map(blacklist, function(entry) {
    return validateStringForBlacklist(entry);
  });
}

function validateStringForBlacklist(entry) {
  return entry.toLowerCase().trim();
}

/** EXPORTS **/

exports.contains = function(label) {
  var validated = validateStringForBlacklist(label);

  for (var i = 0; i < blacklist.length; i++) {
    var entry = blacklist[i];

    if (validated.contains(entry)) {
      return true;
    }
  }

  return false;
}

