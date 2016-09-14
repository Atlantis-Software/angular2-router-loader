var loaderUtils = require('loader-utils');
var path = require('path');
var utils = require('./utils');

module.exports = function(source, sourcemap) {
  this.cacheable && this.cacheable();

  // regex for loadChildren string
  var loadChildrenRegex = /loadChildren:* ['|"](.*?)['|"]/gm;

  // parse query params
  var query = loaderUtils.parseQuery(this.query);

  // get query options
  var delimiter = query.delimiter || '#';
  var aot = query.aot || false;
  var moduleSuffix = query.moduleSuffix || '.ngfactory';
  var factorySuffix = query.factorySuffix || 'NgFactory';
  var loader = query.loader || 'require';
  var genDir = query.genDir || '';

  // get the filename path
  var resourcePath = this.resourcePath;
  var filename = utils.getFilename(resourcePath);

  var replacedSource = source.replace(loadChildrenRegex, function(match, loadString) {
    // split the string on the delimiter
    var parts = loadString.split(delimiter);

    // get the file path and module name
    var filePath = parts[0] + (aot ? moduleSuffix : '');
    var moduleName = (parts[1] || 'default') + (aot ? factorySuffix : '');

    // update the file path for non-ngfactory files
    if (aot && filename.substr(-9) !== moduleSuffix.substr(-9)) {
      // find the relative dir to file from the genDir
      var relativeDir = path.relative(path.dirname(resourcePath), path.resolve(genDir));

      // build the relative path from the genDir
      filePath = path.join(relativeDir, filePath);
    }

    filePath = utils.normalizeFilePath(filePath);

    if (loader === 'system') {
      return utils.getSystemLoader(filePath, moduleName);
    } else {
      return utils.getRequireLoader(filePath, moduleName);
    }
  });

  if (this.callback) {
    this.callback(null, replacedSource, sourcemap);
  } else {
    return replacedSource;
  }
}
