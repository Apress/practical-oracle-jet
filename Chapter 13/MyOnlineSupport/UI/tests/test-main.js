var TEST_REGEXP = /(spec)\.js$/i;
var VIEWMODEL_REGEXP = /viewModels\//
var allTestFiles = [];
var allModules = [];
var normalizedTestModule = function(file) {
    return file.replace(/\.js$/, '');
}
// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    allTestFiles.push(file);
  } else if(VIEWMODEL_REGEXP.test(file)){
    allModules.push(normalizedTestModule(file)) 
  }
});
require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base/web/js',
  // example of using a couple of path translations (paths), to allow us to refer to different library dependencies, without using relative paths
  paths:
    {
      knockout: 'libs/knockout/knockout-3.4.2.debug',
      jquery: 'libs/jquery/jquery-3.3.1',
      'jqueryui-amd': 'libs/jquery/jqueryui-amd-1.12.1',
      promise: 'libs/es6-promise/es6-promise',
      hammerjs: 'libs/hammer/hammer-2.0.8',
      ojdnd: 'libs/dnd-polyfill/dnd-polyfill-1.0.0',
      ojs: 'libs/oj/v6.0.0/debug',
      ojL10n: 'libs/oj/v6.0.0/ojL10n',
      ojtranslations: 'libs/oj/v6.0.0/resources',
      text: 'libs/require/text',
      signals: 'libs/js-signals/signals',
      customElements: 'libs/webcomponents/custom-elements.min',
      css: 'libs/require-css/css', 
      appUtils: 'utils/appUtils',
      Dragibility: 'libs/draggability/draggabilly.pkgd',
      bridget: 'libs/bridget/jquery-bridget',
      'touchr': 'libs/touchr/touchr',
      'trumbowyg': 'libs/trumbowyg/trumbowyg.min',
      'appUtils': 'utils/app-utils',
      'inline-search': 'jet-composites/inline-search/1.0.0'
      },
  // example of using a shim, to load non AMD libraries (such as underscore)
  shim:
  {'jquery':
    {
      exports: ['jQuery', '$']
    }
  },
  // dynamically load all test files
  deps: allTestFiles,
  // we have to kickoff jasmine, as it is asynchronous
  callback: require(allModules, function () {
    window.__karma__.start()
  })
}); 