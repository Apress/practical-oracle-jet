define(['knockout'],
    function (ko) {
        function appUtils() {
            var self = this;

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

        }
        return new appUtils;
    }
)