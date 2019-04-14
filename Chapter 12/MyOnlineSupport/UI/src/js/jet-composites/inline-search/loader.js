/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
define(['ojs/ojcomposite', 'text!./inline-search-view.html', './inline-search-viewModel', 'text!./component.json', 'css!./inline-search-styles'],
  function(Composite, view, viewModel, metadata) {
    Composite.register('inline-search', {
      view: view,
      viewModel: viewModel,
      metadata: JSON.parse(metadata)
    });
  }
);