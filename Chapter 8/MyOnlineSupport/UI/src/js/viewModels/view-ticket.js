define(['ojs/ojcore', 
        'knockout', 
        'jquery', 
        'appUtils',
        'ojs/ojlistview', 
        'ojs/ojarraydataprovider', 
        'trumbowyg',
        'ojs/ojfilepicker'
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
        self.uploadedFile = ko.observableArray([]);
        self.allowedFileTypes = ko.observableArray(['image/*']);

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
        self.ticketReply = function() {
            var date = new Date();
            var attachment = [];

            if(self.uploadedFile()[0] != null){
                self.uploadFile()
                .then(function (success){
                    attachment =  [{
                        "filePath": self.uploadedFile()[0].name,
                        "fileSize": bytesToSize(self.uploadedFile()[0].size),
                        "timestamp": date.toISOString(),
                    }]

                    self.addTicketReplytoCollection(attachment, date);
                })
                .catch(function(error){
                    console.error('Error uploading file')
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



        /* Promise to call the file upload function */
        self.uploadFile = function () { 
            return new Promise(
                function (resolve, reject) {
                    var file = $( "#fileUpload" ).find( "input" )[0].files[0];
                    var data = new FormData();
                    data.append("file", file);
                    $.ajax({
                        type: "POST",
                        url: "http://localhost:8080/tickets/upload/" + self.ticketId(),
                        contentType: false,
                        processData: false,
                        data: data,
                        success: function (result) {
                            resolve("success")
                            console.log("File uploaded successfully!");
                        },
                        error: function (err, status, errorThrown) {
                            reject(err);
                            console.error("Error")
                        }
                    });
                }
            )
        }

        /* Function to convert bytes to size
            Source: http://codeaid.net/javascript/convert-size-in-bytes-to-human-readable-format-(javascript)#comment-1
        */
        function bytesToSize(bytes) {
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes == 0) return 'n/a';
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
        };

        /* Function to automatically scroll the user to the reply editor */
        self.scrollToReply = function () {
            document.getElementById('ticket-reply-area').scrollIntoView();
        }





    
    

    }
  return ViewTicketViewModel;
});