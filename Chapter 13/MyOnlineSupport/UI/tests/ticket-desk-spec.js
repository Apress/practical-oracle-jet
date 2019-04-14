define(['viewModels/ticket-desk'], function (TicketDeskViewModel) {
    describe('Ticket Desk Module - ', function () {
        var viewModel;
        beforeEach(function () {
            viewModel = new TicketDeskViewModel();
        });
        describe('Example Test for onTabRemove Function - ', function () {
            it('Check onTabRemove function runs and passes the tab ID to the delete tab function', function () {
                const deleteTabSpy = spyOn(viewModel, 'deleteTab');
                const event = {
                    detail: {
                        key: 1
                    },
                    preventDefault() { },
                    stopPropagation() { }
                }
                viewModel.onTabRemove(event);
                expect(deleteTabSpy).toHaveBeenCalledWith(1); 
            });
        });
    });
});