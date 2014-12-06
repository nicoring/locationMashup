var fs = require('fs'),
    readline = require('readline');

var file = process.argv[2];

var rd = readline.createInterface({
    input: fs.createReadStream(file),
    terminal: false
});

var snippetCount = 3;
var counter = 0;
var snippet = [];
var result = "";

rd.on('line', function(line) {
  counter++;
  snippet.push(line.trim());

  if (counter == snippetCount) {

    process.stdout.write( parseSnippet(snippet) + "\n");

    counter = 0;
    snippet = [];
  }

});

function parseSnippet(snippet) {

  var regCutFloat = /(?:<literal datatype="([\S]+)">(-?[\d]*\.[\d]*E-?\d+))"/;
  snippet[2] = snippet[2].replace(regCutFloat, function(match, floatUrl, floatString, offset, fullString) {
    return "\"" + floatString + "\"^^<" + floatUrl + ">";
  });

  return snippet.join(" ") + " .";

}
