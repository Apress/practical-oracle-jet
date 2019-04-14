define(['ojs/ojcore', 
        'knockout', 
        'jquery', 
        'appUtils',
        'signals',
        'ojs/ojlistview', 
        'ojs/ojarraydataprovider', 
        'trumbowyg',
        'ojs/ojfilepicker',
        'ojs/ojselectcombobox',
        'ojs/ojlabel',
        'ojs/ojdialog',
        'ojs/ojgauge'
],
 
  function (oj, ko, $, appUtils, signals) {
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
        self.uploadedFile = ko.observableArray([]);
        self.allowedFileTypes = ko.observableArray(['image/*']);
        self.closeTicketSignal = params.closeTicketSignal;
        self.updatePrioritySignal = params.updatePrioritySignal;
        self.priority = ko.observable();
        self.closureReason = ko.observable();
        self.closedTicketRatingValue = ko.observable();


        self.ticketModel = ko.computed(function () {
            self.ticketId(params.ticketModel().get('id'))
            self.title(params.ticketModel().get('title'))
            self.author(params.ticketModel().get('author'))
            self.dateCreated(params.ticketModel().get('dateCreated'))
            self.message(params.ticketModel().get('message'))
            self.status(params.ticketModel().get('status'))
            self.attachment(params.ticketModel().get('attachment'))
            self.priority(params.ticketModel().get('priority'))
            self.closedTicketRatingValue(params.ticketModel().get('ticketRating'))
            return params.ticketModel();
        });

        self.handleAttached = function () {
            $('#ticket-reply-area').trumbowyg(
                {
                    btns: ['bold', 'italic', 'underline'],
                    resetCss: true,
                    removeformatPasted: true
                }
            );
        }
  
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
            } else if (status === "New") {
                return "This is a new ticket that will be looked into shortly by a member of the team. Please check back soon."
            }
        }

        /* List View Collection and Model */
        self.ticketRepliesDataSource = ko.observable();
        self.ticketReplyModel = oj.Model.extend({
            idAttribute: 'id',
            customURL: function () {
                var retObj = {};
                retObj['url'] = "http://localhost:8080/tickets/replies/" + self.ticketId()
                return retObj
            }
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
            $('#ticket-reply-area').trumbowyg('empty');
            self.uploadedFile('');
        })

        self.fileSelectionListener = function(event){
            var file = event.detail.files;
            self.uploadedFile(file)
        }

        self.ticketReply = function () {
            var date = new Date();
            var attachment = [];
            if (self.uploadedFile()[0] != null) {
                appUtils.uploadAttachment(self.ticketId(), self.uploadedFile()[0])
                    .then(function (attachment) {
                        attachment = attachment;
                        self.addTicketReplytoCollection(attachment, date);
                    })
                    .catch(function (error) {
                        console.log(error)
                    })
            } else {
                self.addTicketReplytoCollection(attachment, date);
            }
        }

        /* Function to build up the ticket reply and add it to the collection */
        self.addTicketReplytoCollection = function(attachment, date){
            var newReply = {
                "author": "Charlotte Illidge",
                "timestamp": date.toISOString(),          
                "note": $('#ticket-reply-area').trumbowyg('html'),
                "attachment": attachment
            }

            self.ticketReplies.create(newReply, {
                wait: true,
                success: function(model, response, options){
                    console.log("Success")
                },
                error: function(err, status, errorThrown){
                    console.error("Error")
                }
            })

            $('#ticket-reply-area').trumbowyg('empty');
            self.uploadedFile('');
        }

        /* Function to automatically scroll the user to the reply editor */
        self.scrollToReply = function () {
            document.getElementById('ticket-reply-area').scrollIntoView();
        }

        /* Functions to close a ticket via a signal to the ticket desk VM */
        self.confirmCloseDialog = function (event) {
            document.getElementById('close-confirmation-dialog').open();
        }

        self.closeDialog = function (event) {
            document.getElementById('close-confirmation-dialog').close();
        }

        self.closeTicket = function () {
            self.closeTicketSignal.dispatch(self.ticketId(), self.closureReason());
            self.closeDialog();
        }

        /* Function to escalate a ticket via a signal to the ticket desk VM */
        self.escalatePriority = function () {
            // Only send the signal if the priority is lower than 1
            if (self.priority() > 1) {
                self.updatePrioritySignal.dispatch(self.ticketId());
            }
        }

        self.ratingValueChanged = function(event) {
            self.closedTicketRatingValue(event.detail['value']);
        }
            




    
    

    }
  return ViewTicketViewModel;
});