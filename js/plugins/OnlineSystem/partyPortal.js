    export {PartyPortalWindow};
    import {$onlineParty, $gameNetwork} from "./onlineSystem";

    PartyPortalWindow.prototype = Object.create(Window_Command.prototype);
    PartyPortalWindow.prototype.constructor = PartyPortalWindow;

    function PartyPortalWindow(x, y) {
        Window_Command.prototype.initialize.call(this, x, y, 100, 100);
        // this.initialize.apply(this, arguments);
    }
    
    PartyPortalWindow.prototype.initialize = function () {
      
    }

    PartyPortalWindow.prototype.makeCommandList = function () {
        this.makeCharacterCommands();
    };

    PartyPortalWindow.prototype.populatePlayerOptions = function () {
        let context = this;
        let players = $gameNetwork.networkMapEvents;
        for (let key in players) {
            let player = players[key];
            $onlineParty.playerOptions.push(player);
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
        $onlineParty.playerOptions.forEach(p => {
            context.addCommand(`${p._accountUserName}`, 'addPlayerToParty', true, `${p._accountUserName}`)
        });
    };

