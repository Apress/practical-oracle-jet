/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';
define(
    ['knockout', 'jquery', 'ojL10n!./resources/nls/inline-search-strings'], function (ko, $, componentStrings) {
    
    function InlineSearchModel(context) {
        var self = this;
        
        //At the start of your viewModel constructor
        var busyContext = oj.Context.getContext(context.element).getBusyContext();
        var options = {"description": "CCA Startup - Waiting for data"};
        self.busyResolve = busyContext.addBusyState(options);

        self.composite = context.element;

       // Variable Setup
        self.collectionToBeFiltered = ko.observable(context.properties.data);
        self.persistentModels = [];
        self.filterAttribute = ko.observable(context.properties.filterAttribute);
        self.searchTerm = ko.observable();
        self.searchTerm.extend({ rateLimit: 500 });
        self.properties = context.properties;
        self.res = componentStrings['inline-search'];

        /* Wait for models to be passed in and when they are assign them to the persistentModels variable */
        self.propertyChanged = function(event){
          if(event.property === 'models'){
                self.persistentModels = event.value;
          }
        }

        /* Filter for checking if the entered values matches with one of the model attributes */
        self.valueFilter = function (model, attr, value) {
          var name = model.get(attr);
          return (name.toLowerCase().indexOf(value.toLowerCase()) > -1);
        };

      /* Function to handle the filtering of the collection when a user enters a value into the search box */
      self.searchTerm.subscribe(function (newValue) {
        if (newValue.length == 0) {
          var clonedCollection = self.collectionToBeFiltered().clone()
          clonedCollection.reset(self.persistentModels);
          context.properties.data = clonedCollection
        } else {
          self.collectionToBeFiltered().reset(self.persistentModels);
          var filterObject = {}
          filterObject[self.filterAttribute()] = { value: newValue, comparator: self.valueFilter };
          var ret = self.collectionToBeFiltered().where(filterObject);
          var clonedCollection = self.collectionToBeFiltered().clone()
          clonedCollection.reset(ret);
          context.properties.data = clonedCollection
        }
      });

        //Once all startup and async activities have finished, relocate if there are any async activities
        self.busyResolve();
    };
    InlineSearchModel.prototype._resetSearch = function () {
      this.searchTerm('')
    };

    //Lifecycle methods - uncomment and implement if necessary 
    //ExampleComponentModel.prototype.activated = function(context){
    //};

    //ExampleComponentModel.prototype.connected = function(context){
    //};

    //ExampleComponentModel.prototype.bindingsApplied = function(context){
    //};

    //ExampleComponentModel.prototype.disconnect = function(context){
    //};

    //ExampleComponentModel.prototype.propertyChanged = function(context){
    //};

    return InlineSearchModel;
});