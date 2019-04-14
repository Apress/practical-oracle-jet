define(['ojs/ojcore', 
        'knockout', 
        'jquery', 
        'appUtils',
        'ojs/ojlistview', 
        'ojs/ojarraydataprovider', 
],
 
  function (oj, ko, $, appUtils) {
    function ViewTicketViewModel(params) {
      var self = this;
        /* Variables */
        self.ticketId = ko.observable();
        self.title = ko.observable();
        self.author = ko.observable();
        self.dateCreated = ko.observable();
        self.showDateDifference = ko.observable();
        self.message = ko.observable();
        self.status = ko.observable()
        self.attachment = ko.observable();
        self.formatDate = appUtils.formatDate;

        self.ticketModel = ko.computed(function () {
            self.ticketId(params.ticketModel().get('id'))
            self.title(params.ticketModel().get('title'))
            self.author(params.ticketModel().get('author'))
            self.dateCreated(params.ticketModel().get('dateCreated'))
            self.message(params.ticketModel().get('message'))
            self.status(params.ticketModel().get('status'))
            self.attachment(params.ticketModel().get('attachment'))
            return params.ticketModel();
        });

        /* Function to calculate date ranges */
        self.dateDifference = function (date) {
            var todaysDate = new Date();
            var messageDate = new Date(date)
            var res = Math.abs(todaysDate - messageDate) / 1000;
            var days = Math.floor(res / 86400);
            if (days < 1) {
                return "less than a day ago"
            }
            else if (days === 1) {
                return "a day ago"
            }
            else if (days <= 7) {
                return "less than a week ago"
            }
            else if (days > 7 && days <= 30) {
                return "more than a week ago"
            }
            else if (days > 30) {
                return "more than a month ago"
            }
        }

        /* Function to get ticket status */
        self.ticketStatus = function (status) {
            if (status === "Working") {
                return "Ticket status currently 'working', our team are hard at work looking into your issue."
            } else if (status === "Closed") {
                return "Ticket status is 'closed', and is now in read-only mode. In order to help us continue to offer the best support we can, please rate your experience."
            } else if (status === "Awaiting Customer Response") {
                return "Ticket status is currently 'awaiting customer response', our team are awaiting your reply."
            }
        }

        /* List View Collection and Model */
        self.ticketRepliesDataSource = ko.observable();
        self.ticketReplyModel = oj.Model.extend({
            idAttribute: 'id'
        });

        var ticketRepliesCollection = oj.Collection.extend({
            customURL: function () {
                var retObj = {};
                retObj['url'] = "http://localhost:8080/tickets/replies/" + self.ticketId()
                return retObj
            },
            model: self.ticketReplyModel
        });

        self.ticketReplies = new ticketRepliesCollection();
        self.ticketRepliesDataSource(new oj.CollectionTableDataSource(self.ticketReplies));

        self.ticketId.subscribe(function () {
            self.ticketReplies.fetch();
        })


    
    

    }
  return ViewTicketViewModel;
});