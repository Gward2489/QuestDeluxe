(function () {

    PartyPortalWindow.prototype = Object.create(Window_Command.prototype);
    PartyPortalWindow.prototype.constructor = PartyPortalWindow;

    function PartyPortalWindow() {
        this.initialize.apply(this, arguments);
    }
    
    PartyPortalWindow.prototype.initialize = function () {
        this.playerOptions = [];
        this.partyOptions = [];
    }

    PartyPortalWindow.prototype.makeCommandList = function () {
        this.makeCharacterCommands();
    };

    PartyPortalWindow.prototype.populatePlayerOptions = function () {
        let context = this;
        let players = $gameNetwork.networkMapEvents;
        for (let key in players) {
            let player = players[key];
            context.playerOptions.push(player);
        };
    };

    PartyPortalWindow.prototype.populatePartyOptions = function () {
        let context = this;
        let parties = $onlineParty.openParties;
        parties.forEach(p => {
            context.partyOptions.push(p);
        });
    };

    PartyPortalWindow.prototype.makeCharacterCommands = function () {
        let context = this;
        context.playerOptions.forEach(p => {
            context.accCommand(`${p._accountUserName}`, 'addPlayerToParty', true, `${p._accountUserName}`)
        });
    };

    PartyPortalWindow.prototype.addPlayerToParty = function () {
        console.log('score');
    };

    $onlineParty.makeOnlinePartyPortal = function () {
        var partyPortal = new PartyPortalWindow();
        partyPortal.populatePlayerOptions();
        partyPortal.makeCommandList();
    }

}) ();