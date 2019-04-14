define(['ojs/ojcore', 
        'knockout', 
        'jquery',
        'ojs/ojgauge'],
 
  function (oj, ko, $) {
    function RepresentativeViewModel(params) {
      var self = this;

      self.name = ko.observable();
      self.role = ko.observable();
      self.bio = ko.observable()
      self.ratingValue = ko.observable();

      self.repId = ko.computed(function () {
        return params.repId;
      });

      $.ajax({
        type: "GET",
        url: "http://localhost:8080/representative-information/" + self.repId(),
        crossDomain: true,
        success: function (res) {
            self.name(res.name)
            self.role(res.role)
            self.bio(res.bio)
            self.ratingValue(res.ratingValue)
        },
        error: function (jqXHR, textStatus, errorThrown) {
           oj.Logger.error(jqXHR);
        }
      });

    }
    return RepresentativeViewModel;
  }
);