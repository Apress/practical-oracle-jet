define(['knockout'],
  function (ko) {
    function appUtils() {
      var self = this;

      /* Utils */
      self.formatDate = function (date) {
        var formatDate = oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME)
          .createConverter(
            {
              'pattern': 'dd/MM/yyyy'
            }
          );
        return formatDate.format(date)
      }

      /*
        Source: http://codeaid.net/javascript/convert-size-in-bytes-to-human-readable-format-(javascript)#comment-1
      */
      self.bytesToSize = function (bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return 'n/a';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
      };

      /* Function to upload the new attachment and return a promise */
      self.uploadAttachment = function (ticketId, uploadedFile) {
        var date = new Date();
        var attachment = [];
        return new Promise(
          function (resolve, reject) {
            var file = $("#fileUpload").find("input")[0].files[0];
            var data = new FormData();
            data.append("file", file);
            $.ajax({
              type: "POST",
              url: "http://localhost:8080/tickets/upload/" + ticketId,
              contentType: false,
              processData: false,
              data: data,
              success: function (result) {
                attachment = [{
                  "filePath": uploadedFile.name,
                  "fileSize": self.bytesToSize(uploadedFile.size),
                  "timestamp": date.toISOString()
                }]
                resolve(attachment)
              },
              error: function (err, status, errorThrown) {
                reject(err);
                oj.Logger.error('Error uploading attachement ' + err);
              }
            });
          }
        );
      }


    }
    return new appUtils;
  }
)