var nebree8App = angular.module('nebree8App', ['ngMaterial']);

nebree8App.directive('focusOn', function() {
   return function(scope, elem, attr) {
      scope.$on(attr.focusOn, function(e) {
          elem[elem.length - 1].focus();
      });
   };
});

nebree8App.controller('DrinkAppCtrl', ['$scope', '$http', '$mdDialog', function($scope, $http, $mdDialog) {
  console.log("DrinkAppCtrl constructor");
  $scope.query = '';
  $scope.selected_drink = null;
  $scope.user_name = '';

  $http.get('/all_drinks', {cache: true}).success(function(data) {
    $scope.db = data;
  });
  $scope.drinkUrl = function(n) {
    return n.toLowerCase().replace(/[ ()]/g, "_").replace(/&/g, 'and');
  }
  $scope.ingredientsCsv = function(drink) {
    var names = [];
    for (var i = 0; i < drink.ingredients.length; i++) {
      names.push(drink.ingredients[i].name);
    }
    return names.join(", ");
  }
  $scope.selectDrink = function(drink) {
    console.log("select", drink);
    $scope.selected_drink = angular.copy(drink);
  }
  $scope.cancelSelection = function() {
    console.log("cancel selection");
    $scope.selected_drink = null;
  }
  $scope.nonBreakSpace = function(n) {
    return n.replace(/ /g, "&nbsp;")
  }
  $scope.makeDrink = function(event) {
    var EnterNameController = ['$scope', '$mdDialog', function ($scope, $mdDialog, user_name) {
      $scope.user_name = user_name;
      $scope.$broadcast('dialogOpened');
      $scope.closeDialog = function() {
        $mdDialog.hide($scope.user_name);
      };
      $scope.cancel = function() {
        $mdDialog.hide(null);
      }
    }];
    $mdDialog.show({
      controller: EnterNameController,
      targetEvent: event,
      locals: { user_name: $scope.user_name },
      template: '<md-dialog aria-label="Enter your name">' +
                ' <form ng-submit="closeDialog()"> ' +
                ' <md-toolbar><div class="md-toolbar-tools"> ' +
                '  <h2>What should we call you?</h2> ' +
                '  <span flex></span><md-button class="md-icon-button" ' +
                '      ng-click="cancel()"><md-icon md-svg-src="img/icons/ic_close_24px.svg" aria-label="Close dialog"></md-icon></md-button> ' +
                ' </div></md-toolbar> ' +
                ' <md-dialog-content>' +
                '   <md-input-container><label>Your Name</label> ' +
                '   <input type="text" ng-model="user_name" focus-on="dialogOpened"> ' +
                '   </md-input-container> ' +
                ' </md-dialog-content>' +
                ' <div class="md-actions"> ' +
                '  <md-button ng-click="cancel()">Cancel</md-button> ' +
                '  <md-button type="submit" ng-disabled="!user_name" class="md-primary"> ' +
                '      Make Drink</md-button> ' +
                ' </div> ' +
                ' </form> ' +
                '</md-dialog>'
    })
    .then(function(answer) {
      console.log("answer", answer);
      if (answer) {
        $scope.user_name = $scope.selected_drink.user_name = answer;
        $scope.drink_id = 'unknown';
        $http({
          'method': 'POST',
          'url': '/api/order',
          'params': {'recipe': $scope.selected_drink},
          'responseType': 'json'
        }).then(function(response) {
          console.log("response", response)
          $scope.drink_id = response.data.id;
        })
        console.log("Making drink ", $scope.selected_drink);
        $scope.selectDrink(null);
      }
    }, function() {
      console.log("dialog cancelled");
    });
  }
}]);
