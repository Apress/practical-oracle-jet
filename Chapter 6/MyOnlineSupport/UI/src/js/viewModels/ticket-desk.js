define(['ojs/ojcore', 
        'knockout', 
        'jquery', 
        'ojs/ojlistview', 
        'ojs/ojinputtext', 
        'ojs/ojcollectiontabledatasource', 
        'ojs/ojarraytabledatasource',
        'ojs/ojmodel',
        'ojs/ojvalidation-datetime'],
 function(oj, ko, $) {
  
    function TicketDeskViewModel() {
      var self = this;

      /* Variables */
      self.ticketListDataSource = ko.observable();
      self.selectedTabItem = ko.observable("settings");

      /* List View Collection and Model */
      var ticketModelItem = oj.Model.extend({
        idAttribute: 'id'
      });
        
      var ticketListCollection = new oj.Collection(null, {
        url: "http://localhost:8080/tickets",
        model: ticketModelItem
      });

      self.ticketListDataSource(new oj.CollectionTableDataSource(ticketListCollection));
      
      /* Utils */
      self.formatDate = function (date){
        var formatDate = oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME)
          .createConverter(
            { 
              'pattern': 'dd/MM/yyyy' 
            }
          ); 
        return formatDate.format(date)
      }

      /* Tab Component */
      self.tabData = ko.observableArray([{
        name: 'Settings',
        id: 'settings'
      },
      {
        name: 'Tools',
        id: 'tools'
      },
      {
        name: 'Base',
        id: 'base'
      },
      {
        name: 'Environment',
        disabled: 'true',
        id: 'environment'
      },
      {
        name: 'Security',
        id: 'security'
      }]);

      self.tabBarDataSource = new oj.ArrayTableDataSource(self.tabData, { idAttribute: 'id' });

      self.deleteTab = function (id) {
        var hnavlist = document.getElementById('ticket-tab-bar'),
          items = self.tabData();
        for (var i = 0; i < items.length; i++) {
          if (items[i].id === id) {
            self.tabData.splice(i, 1);
            oj.Context.getContext(hnavlist)
              .getBusyContext()
              .whenReady()
              .then(function () {
                hnavlist.focus();
              });
            break;
          }
        }
      };

      self.onTabRemove = function (event) {
        self.deleteTab(event.detail.key);
        event.preventDefault();
        event.stopPropagation();
      };

    }

    return TicketDeskViewModel;
  }
);