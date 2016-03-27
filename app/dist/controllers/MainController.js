/// <reference path="../_all.ts" />
var ContactManagerApp;
(function (ContactManagerApp) {
    var MainController = (function () {
        function MainController(userService, $log, $mdSidenav, $mdToast, $mdDialog, $mdMedia, $mdBottomSheet) {
            var _this = this;
            this.userService = userService;
            this.$log = $log;
            this.$mdSidenav = $mdSidenav;
            this.$mdToast = $mdToast;
            this.$mdDialog = $mdDialog;
            this.$mdMedia = $mdMedia;
            this.$mdBottomSheet = $mdBottomSheet;
            this.users = [];
            this.selected = null;
            this.newNote = new ContactManagerApp.Note('', null);
            this.searchText = '';
            this.tabIndex = 0;
            var self = this;
            this.userService
                .loadAllUsers()
                .then(function (users) {
                self.users = users;
                // inital selected user to display
                self.selected = users[0];
                self.userService.selectedUser = self.selected;
                _this.$log.log(self.users);
            });
        }
        MainController.prototype.toggleSideNav = function () {
            this.$mdSidenav('left').toggle();
        };
        MainController.prototype.selectUser = function (user) {
            this.selected = user;
            this.userService.selectedUser = user;
            var sideNav = this.$mdSidenav('left');
            if (sideNav.isOpen()) {
                sideNav.close();
            }
            this.tabIndex = 0;
        };
        MainController.prototype.showContactOption = function ($event) {
            var _this = this;
            this.$mdBottomSheet.show({
                parent: angular.element(document.getElementById('wrapper')),
                templateUrl: './dist/views/contact-sheet.html',
                controller: ContactManagerApp.ContactPanelController,
                controllerAs: 'cp',
                bindToController: true,
                targetEvent: $event
            }).then(function (clickedItem) {
                // ensures clickedItem is not undefined before logging it to the console
                clickedItem && _this.$log.log(clickedItem.name + 'clicked!');
            });
        };
        MainController.prototype.addUser = function ($event) {
            var _this = this;
            var self = this;
            var useFullScreen = (this.$mdMedia('sm') || this.$mdMedia('xs'));
            this.$mdDialog.show({
                templateUrl: './dist/views/newUserDialog.html',
                parent: angular.element(document.body),
                targetEvent: $event,
                controller: ContactManagerApp.AddUserDialogController,
                controllerAs: 'ctrl',
                clickOutsideToClose: true,
                fullscreen: useFullScreen
            }).then(function (user) {
                var newUser = ContactManagerApp.User.fromCreate(user);
                self.users.push(newUser);
                self.selectUser(newUser);
                self.openToast('User added');
            }, function () {
                _this.$log.log('You cancelled the dialog.');
            });
        };
        MainController.prototype.clearNotes = function ($event) {
            var confirm = this.$mdDialog.confirm()
                .title('Are you sure you want to clear all the notes?')
                .textContent('All notes will be deleted, you can\'t undo this action.')
                .targetEvent($event)
                .ok('Yes')
                .cancel('No');
            var self = this;
            this.$mdDialog.show(confirm).then(function () {
                self.selected.notes = [];
                self.openToast('Cleared notes');
            });
        };
        MainController.prototype.setFormScope = function (scope) {
            this.formScope = scope;
        };
        MainController.prototype.addNote = function () {
            this.selected.notes.push(this.newNote);
            // reset the form
            this.formScope.noteForm.$setUntouched();
            this.formScope.noteForm.$setPristine();
            this.newNote = new ContactManagerApp.Note('', null);
            this.openToast('Note added');
        };
        MainController.prototype.removeNote = function (note) {
            var foundIndex = this.selected.notes.indexOf(note);
            this.selected.notes.splice(foundIndex, 1);
            this.openToast('Note was removed');
        };
        MainController.prototype.openToast = function (message) {
            this.$mdToast.show(this.$mdToast.simple()
                .textContent(message)
                .position('top right')
                .hideDelay(300));
        };
        MainController.$inject = ['userService', '$log', '$mdSidenav', '$mdToast', '$mdDialog', '$mdMedia', '$mdBottomSheet'];
        return MainController;
    }());
    ContactManagerApp.MainController = MainController;
})(ContactManagerApp || (ContactManagerApp = {}));
//# sourceMappingURL=MainController.js.map