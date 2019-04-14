define(['ojs/ojcore', 
        'knockout', 
        'jquery', 
        'appUtils',
        'signals',
        'ojs/ojlistview', 
        'ojs/ojinputtext', 
        'ojs/ojcollectiontabledatasource', 
        'ojs/ojarraytabledatasource',
        'ojs/ojmodel',
        'ojs/ojvalidation-datetime',
        'ojs/ojconveyorbelt',
        'inline-search/loader',
        'ojs/ojmessages'],
 function(oj, ko, $, appUtils, signals) {
  
    function TicketDeskViewModel() {
      var self = this;

      /* Variables */
      self.ticketListDataSource = ko.observable();
      self.selectedTabItem = ko.observable();
      self.selectedTicket = ko.observableArray([]);
      self.selectedTicketModel = ko.observable();
      self.selectedTicketRepId = ko.observable();
      self.formatDate = appUtils.formatDate;
      self.closeTicketSignal = new signals.Signal();
      self.updatePrioritySignal = new signals.Signal();
      self.persistentModels = ko.observableArray();
      self.filterAttribute = 'title';  
      self.selectionRequired = ko.observable(true);
      self.createVisible = ko.observable(false)
      self.newTicketId = '';
      self.createNewTicketSignal = new signals.Signal();
      self.applicationMessages = ko.observableArray([]);
      self.ticketReplyFailure = new signals.Signal();

      /* List View Collection and Model */
      var ticketModelItem = oj.Model.extend({
        idAttribute: 'id'
      });
        
      var ticketListCollection = new oj.Collection(null, {
        url: "http://localhost:8080/tickets",
        model: ticketModelItem
      });

      self.updateDataSource = function (event) {
        self.selectionRequired(false);
        self.ticketListDataSource(new oj.CollectionTableDataSource(self.ticketList()));
        var busyContext = oj.Context.getPageContext().getBusyContext();
        busyContext.whenReady().then(function () {
          self.selectionRequired(true);
        });
      }

      self.ticketList = ko.observable(ticketListCollection);
      self.ticketListDataSource(new oj.CollectionTableDataSource(self.ticketList()));
      self.ticketList().fetch({
        success: function success(data) {
          self.persistentModels(data.models);
          self.newTicketId = data.models[0].id + 1;
        }
      });

      /*
        Toggle the state of the create ticket module
      */
      self.toggleCreateTicket = function () {
        if (self.createVisible() === true) {
          oj.AnimationUtils['slideOut']($('#create-new-ticket')[0], { 'direction': 'top' }).then(function () {
            self.createVisible(false);
          });
        }
        else {
          self.createVisible(true);
        }
      }

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
        if(id != self.persistentModels()[0].get('id')){

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
        if (self.ticketList().get(self.selectedTabItem()) === undefined) {
          document.getElementById("search-component").resetSearch();
        }
        oj.Context.getContext(document.getElementById("search-component"))
          .getBusyContext()
          .whenReady()
          .then(function () {
            self.selectedTicketModel(self.ticketList().get(self.selectedTabItem()))
            self.selectedTicket([self.selectedTabItem()])
          })
      }

      /* New ticket creation listener, when a dispatch signal is sent */
      self.createNewTicketSignal.add(function (newModel) {
        self.ticketList().create(newModel, {
            wait: true,
            at: 0,
            success: function (model, response, options) {
              self.toggleCreateTicket();
              self.persistentModels.push(model)
              self.newTicketId = self.ticketList().models[0].id + 1;
              oj.Logger.info('New ticket successfully created: ' + model.id);
              self.applicationMessages.push(
                {
                  severity: 'confirmation',
                  summary: 'New ticket created',
                  detail: 'The new ticket ' + model.id + ' has been created'
                })
            },
            error: function (err, status, errorThrown) {
              oj.Logger.error('Error creating new ticket: ' + err.status + ' ' + err.statusText);
              self.applicationMessages.push(
                {
                  severity: 'error',
                  summary: 'Error creating ticket',
                  detail: 'Error trying to create new ticket'
                })
            }
        })
      })

      /* Priority update listener, when a dispatch signal is sent, the priority is increased and the model item updated */ 
      self.updatePrioritySignal.add(function (ticketId) {
        var newPriority;
        var modelItem = self.ticketList().get(ticketId);
        var modelData = modelItem.attributes;

        newPriority = modelData.priority - 1;

        var updatedData = {
          id: modelData.id,
          priority: newPriority
        };

        modelItem.save(updatedData, {
          wait: true,
          success: function (model, response, options) {
            oj.Logger.info('Priority upgraded for ticket: ' + model.id);
            self.selectedTicketModel(self.ticketList().get(self.selectedTicket()[0]))
            self.applicationMessages.push(
              {
                severity: 'confirmation',
                summary: 'Priority increased',
                detail: 'The ticket ' + model.id + ' has had its priority increased to ' + newPriority
              }
            )
          },
          error: function (err, status, errorThrown) {
            oj.Logger.error('Error upgrading priority: ' + err.status + ' ' + err.statusText);
            self.applicationMessages.push(
              {
                severity: 'error',
                summary: 'Error updating ticket',
                detail: 'Unable to increase priority for ticket ' + modelData.id
              }
            )
          }
        });
      });

      /* Ticket Reply Failure listener */
      self.ticketReplyFailure.add(function () {
        self.applicationMessages.push(
          {
            severity: 'error',
            summary: 'Error replying to ticket',
            detail: 'Unable to reply to ticket, please try again.'
          }
        )
      })

      /* Close ticket listener, when a dispatch signal is sent, the new object with closed status is created and the model item is updated */ 
      self.closeTicketSignal.add(function (ticketId, closureReason) {
        var modelItem = self.ticketList().get(ticketId);

        var modelData = modelItem.attributes;

        var updatedData = {
          id: modelData.id,
          status: 'Closed',
          closureReason: closureReason
        };

        modelItem.save(updatedData, {
          wait: true,
          success: function (model, response, options) {
            oj.Logger.info('Ticket successfully closed: ' + model.id);
            self.selectedTicketModel(self.ticketList().get(self.selectedTicket()[0]))
            self.applicationMessages.push(
              {
                severity: 'confirmation',
                summary: 'Ticket Closed',
                detail: 'The ticket ' + model.id + ' has been successfully closed'
              }
            )
          },
          error: function (err, status, errorThrown) {
            oj.Logger.error('Error closing ticket: ' + err.status + ' ' + err.statusText);
            self.applicationMessages.push(
              {
                severity: 'error',
                summary: 'Error closing ticket',
                detail: 'Unable to close ticket ' + modelData.id
              }
            )
          }
        });
      })

    }

    return TicketDeskViewModel;
  }
);