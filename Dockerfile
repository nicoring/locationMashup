FROM dockerfile/nodejs-bower-grunt

MAINTAINER Nico Ring <nico.ring@student.hpi.de>


# Install npm and bower packages
ONBUILD ADD package.json /app/
ONBUILD RUN npm install
ONBUILD ADD bower.json /app/
ONBUILD RUN bower install --allow-root

# Copy files
ONBUILD ADD client /app/
ONBUILD ADD server /app/

# Build app with grunt
ONBUILD ADD Gruntfile.js /app/
ONBUILD RUN grunt build

# Define working directory.
WORKDIR /app

# Define default command.
CMD ["npm", "start"]

# Expose ports.
EXPOSE 8080
