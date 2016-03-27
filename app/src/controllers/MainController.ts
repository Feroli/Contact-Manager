/// <reference path="../_all.ts" />

module ContactManagerApp {
    export class MainController {

        static $inject = ['userService', '$log', '$mdSidenav', '$mdToast', '$mdDialog', '$mdMedia', '$mdBottomSheet'];

        constructor(
            private userService: IUserService,
            private $log: ng.ILogService,
            private $mdSidenav: angular.material.ISidenavService,
            private $mdToast: angular.material.IToastService,
            private $mdDialog: angular.material.IDialogService,
            private $mdMedia: angular.material.IMedia,
            private $mdBottomSheet: angular.material.IBottomSheetService) {
            let self = this;

            this.userService
                .loadAllUsers()
                .then((users: User[]) => {
                    self.users = users;
                    // inital selected user to display
                    self.selected = users[0];
                    self.userService.selectedUser = self.selected;

                    this.$log.log(self.users);
                });
        }

        users: User[] = [];
        selected: User = null;
        newNote: Note = new Note('', null);
        searchText: string = '';
        tabIndex: number = 0;

        toggleSideNav(): void {
            this.$mdSidenav('left').toggle();
        }

        selectUser (user: User): void {
            this.selected = user;
            this.userService.selectedUser  = user;

            let sideNav = this.$mdSidenav('left');
            if (sideNav.isOpen()) {
                sideNav.close();
            }

            this.tabIndex = 0;
        }

        showContactOption($event): void {
            this.$mdBottomSheet.show({
                parent: angular.element(document.getElementById('wrapper')),
                templateUrl: './dist/views/contact-sheet.html',
                controller: ContactPanelController,
                controllerAs: 'cp',
                bindToController: true,
                targetEvent: $event
            }).then((clickedItem) => {
                // ensures clickedItem is not undefined before logging it to the console
                clickedItem && this.$log.log(clickedItem.name + 'clicked!');
            });

        }

        addUser($event) {
            let self = this;
            let useFullScreen = (this.$mdMedia('sm') || this.$mdMedia('xs'));


            this.$mdDialog.show({
                templateUrl: './dist/views/newUserDialog.html',
                parent: angular.element(document.body),
                targetEvent: $event,
                controller: AddUserDialogController,
                controllerAs: 'ctrl',
                clickOutsideToClose: true,
                fullscreen: useFullScreen
            }).then((user: CreateUser) => {
                let newUser: User = User.fromCreate(user);
                self.users.push(newUser);
                self.selectUser(newUser);
                self.openToast('User added');
            }, () => {
                this.$log.log('You cancelled the dialog.');
            });
        }

        clearNotes($event) {
            let confirm = this.$mdDialog.confirm()
                .title('Are you sure you want to clear all the notes?')
                .textContent('All notes will be deleted, you can\'t undo this action.')
                .targetEvent($event)
                .ok('Yes')
                .cancel('No');

            let self = this;
            this.$mdDialog.show(confirm).then(() => {
                self.selected.notes = [];
                self.openToast('Cleared notes');
            });
        }

        formScope: any;

        setFormScope(scope) {
            this.formScope = scope;
        }

        addNote(): void {
            this.selected.notes.push(this.newNote);

            // reset the form
            this.formScope.noteForm.$setUntouched();
            this.formScope.noteForm.$setPristine();

            this.newNote = new Note('', null);
            this.openToast('Note added');
        }

        removeNote(note: Note): void {
            let foundIndex: number = this.selected.notes.indexOf(note);
            this.selected.notes.splice(foundIndex, 1);
            this.openToast('Note was removed');
        }

        openToast(message: string): void {
            this.$mdToast.show(
                this.$mdToast.simple()
                    .textContent(message)
                    .position('top right')
                    .hideDelay(300)
            );
        }
    }
}
