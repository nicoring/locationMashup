locationMashup
==============
You need to install Node.js, mongoDB, npm, bower, grunt. If you use OSX you can use `brew` to install node, otherwise you need to download node from  http://nodejs.org/download/, mongoDB from http://www.mongodb.org/downloads.

Run these commands if you use `brew`:
``` bash
# Install Homebrew package manager
ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"

# install node and mongoDB
brew install node mongodb

# if you installed node manually, run this to install npm
curl http://npmjs.org/install.sh | sh
```

Then run these commands and start mongoDB:
``` bash
# install bower and grunt
npm install -g bower grunt

# run this to start the application
npm install && bower install && grunt build --force && npm start
```
You need do download [these](https://drive.google.com/open?id=0B-qPNJhiRTz2fmxZQkE4UGtiNGItbFZfTTFubTNiZmJHYTY4aGdfbnpiOEVfM3U1VTVRWDA&authuser=0) turtle files and put them in an database whoch provides a SPARQL endpoint. Then you must edit, the url and graphs in config.js.


