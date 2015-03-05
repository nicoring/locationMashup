locationMashup
==============
You need to install Node.js, mongoDB, npm, bower, grunt. If you use OSX you can use `brew` to install node, otherwise you need to download node from  http://nodejs.org/download/, mongoDB from http://www.mongodb.org/downloads.

Run these commands if you use `brew`:
```bash
# Install Homebrew package manager
ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"

# install node (and npm), mongoDB and nvm
brew install node mongodb
````

On linux use following commands to install:
```bash
# install node, npm, mongoDB
sudo apt-get install node npm mongodb

# install nvm
curl https://raw.githubusercontent.com/creationix/nvm/v0.11.1/install.sh | bash
```

If you have to install manually try this:
```bash
# install node
curl http://npmjs.org/install.sh | sh
```

Then run these commands and start mongoDB:
``` bash
# use recommended node version
nvm install 0.10.35
nvm use 0.10.35

# install bower and grunt
npm install -g bower grunt

# run this to start the application
npm install && bower install && grunt build --force && npm start
```

You need to download [these](https://drive.google.com/open?id=0B-qPNJhiRTz2fmxZQkE4UGtiNGItbFZfTTFubTNiZmJHYTY4aGdfbnpiOEVfM3U1VTVRWDA&authuser=0) turtle files and put them in an database which provides a SPARQL endpoint. Then you have to edit the url and graphs in `server/config.js`.

Unfortunately the dockerfile is not working. Feel free to contact us for help!
