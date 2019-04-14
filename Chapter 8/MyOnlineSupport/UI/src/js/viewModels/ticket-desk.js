define(['ojs/ojcore', 
        'knockout', 
        'jquery', 
        'appUtils',
        'ojs/ojlistview', 
        'ojs/ojinputtext', 
        'ojs/ojcollectiontabledatasource', 
        'ojs/ojarraytabledatasource',
        'ojs/ojmodel',
        'ojs/ojvalidation-datetime',
        'ojs/ojconveyorbelt'],
 function(oj, ko, $, appUtils) {
  
    function TicketDeskViewModel() {
      var self = this;

      /* Variables */
      self.ticketListDataSource = ko.observable();
      self.selectedTabItem = ko.observable();
      self.selectedTicket = ko.observableArray([]);
      self.selectedTicketModel = ko.observable();
      self.selectedTicketRepId = ko.observable();
      self.formatDate = appUtils.formatDate;


      /* List View Collection and Model */
      var ticketModelItem = oj.Model.extend({
        idAttribute: 'id'
      });
        
      var ticketListCollection = new oj.Collection(null, {
        url: "http://localhost:8080/tickets",
        model: ticketModelItem
      });

      self.ticketList = ko.observable(ticketListCollection);
      self.ticketListDataSource(new oj.CollectionTableDataSource(self.ticketList()));

      /* List selection listener */
      self.listSelectionChanged = function () {
        self.selectedTicketModel(self.ticketList().get(self.selectedTicket()[0]))

        // Check if the selected ticket exists within the tab data
        var match = ko.utils.arrayFirst(self.tabData(), function (item) {
          return item.id == self.selectedTicket()[0];
        });

        if (!match) {
          self.tabData.push({
            "name": self.selectedTicket()[0],
            "id": self.selectedTicket()[0]
          });
        }
        self.selectedTicketRepId(self.selectedTicketModel().get('representativeId'));
        self.selectedTabItem(self.selectedTicket()[0]);
      }
  
      /* Tab Component */
      self.tabData = ko.observableArray([]);
      self.tabBarDataSource = new oj.ArrayTableDataSource(self.tabData, { idAttribute: 'id' });

      self.deleteTab = function (id) {
        // Prevent the first item in the list being removed
        if(id != self.ticketList().at(0).id){

          var hnavlist = document.getElementById('ticket-tab-bar'),
            items = self.tabData();
          for (var i = 0; i < items.length; i++) {
            if (items[i].id === id) {
              self.tabData.splice(i, 1);

               /* Check if the current selected list item matches the open tab,
                if so, reset to the first index in the list
              */
              if(id === self.selectedTicket()[0] || self.selectedTicket()[0] != self.selectedTabItem()){ 
                self.selectedTabItem(self.tabData()[0].id);
              }

              oj.Context.getContext(hnavlist)
                .getBusyContext()
                .whenReady()
                .then(function () {
                  hnavlist.focus();
                });
              break;
            }
          }
        }
      };

      self.onTabRemove = function (event) {
        self.deleteTab(event.detail.key);
        event.preventDefault();
        event.stopPropagation();
      };

      self.tabSelectionChanged = function () {
        self.selectedTicketModel(self.ticketList().get(self.selectedTabItem()))
        self.selectedTicket([self.selectedTabItem()])
      } 

    }

    return TicketDeskViewModel;
  }
);