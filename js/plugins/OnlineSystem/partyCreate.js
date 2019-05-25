import {$onlineParty, $gameNetwork} from "./onlineSystem";

PartyCreateWindow.prototype = Object.create(Window_Command.prototype);
PartyCreateWindow.prototype.constructor = PartyCreateWindow;

function PartyCreateWindow(x, y) {
    Window_Command.prototype.initialize.call(this, x, y, 100, 100);
    // this.initialize.apply(this, arguments);
}

PartyCreateWindow.prototype.createNewPartySeeking = function (private, password, maxPlayers) {

    let onlineGroup = {
        private: private,
        password: password,
        maxPlayers: maxPlayers,
        host: $gameNetwork.userAccountName,
        players: [$gameNetwork.userAccountName]
    };

    $onlineParty.partiesSeeking.push(onlineGroup);

};