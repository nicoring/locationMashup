module.exports = function() {
  // capitalize the first letter of a string
  if ( !String.prototype.capitalize ) {
    String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    };
  }

  // fake of `String.prototype.contains` which is available at ECMAScript6
  if ( !String.prototype.contains ) {
    String.prototype.contains = function() {
      return String.prototype.indexOf.apply( this, arguments ) !== -1;
    };
  }
}
