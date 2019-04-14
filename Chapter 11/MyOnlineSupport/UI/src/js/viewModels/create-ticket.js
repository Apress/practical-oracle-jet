define(['ojs/ojcore',
    'knockout',
    'jquery',
    'appUtils',
    'ojs/ojselectcombobox',
    'trumbowyg'
],
    function (oj, ko, $, appUtils) {
        function CreateTicketViewModel(params) {
            var self = this;
            self.newTicketTitle = ko.observable();
            self.newTicketPriority = ko.observable();
            self.uploadedFile = ko.observableArray([]);
            self.allowedFileTypes = ko.observableArray(['image/*']);
            self.createNewTicketSignal = params.createNewTicketSignal;
            self.newTicketId = params.newTicketId;
            self.createInProgress = ko.observable(false);

            self.handleAttached = function () {
                oj.AnimationUtils['slideIn']($('#create-new-ticket')[0], { 'direction': 'bottom' });
                $('#new-ticket-area').trumbowyg(
                    {
                        btns: ['bold', 'italic', 'underline'],
                        resetCss: true,
                        removeformatPasted: true
                    });
            }

            /* Function to create a new ticket */
            self.createTicket = function () {
                var date = new Date();
                var messageArea = $('#new-ticket-area').trumbowyg('html');
                self.createInProgress(true);
                var newTicket = {
                    "id": self.newTicketId,
                    "title": self.newTicketTitle(),
                    "author": "Charlotte Illidge",
                    "representativeId": "1",
                    "priority": self.newTicketPriority(),
                    "service": "stylearchive",
                    "dateCreated": date.toISOString(),
                    "status": "New",
                    "message": messageArea,
                    "attachment": [],
                    "ticketRating": -1
                }
                if (self.uploadedFile()[0] != null) {
                    appUtils.uploadAttachment(self.newTicketId, self.uploadedFile()[0])
                        .then(function (attachment) {
                            newTicket['attachment'] = attachment;
                            self.createNewTicketSignal.dispatch(newTicket);
                        });
                }
                else {
                    self.createNewTicketSignal.dispatch(newTicket);
                }
            }
            self.fileSelectionListener = function (event) {
                var file = event.detail.files
                self.uploadedFile(file)
            }

        }
        return CreateTicketViewModel;
    }
);