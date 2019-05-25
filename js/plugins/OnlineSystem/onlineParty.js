export {Online_Party};
import {$onlineParty, $gameNetwork} from "./onlineSystem";
import {PartyPortalWindow} from "./partyPortal";

function Online_Party() {
    this.initialize.apply(this, arguments);
}

Online_Party.prototype.initialize = function () {
    this.members = [];
    this.partyConnection = {};
    this.isHost = false;
    this.partiesSeeking = [];
    this.playerOptions = [];
    this.partyOptions = [];
    this.currentPartyPortal = {}; 
};

Online_Party.prototype.makeNewPartyConnection = function (asHost) {

    let connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/onlinePartyHub")
    .build();

    $onlineParty.partyConnection = connection;
    (async () => {
        try {
            $onlineParty.partyConnection.start();

            if (asHost) {
                let ping = "hello";
                $onlineParty.partyConnection.invoke("AddToPartyAsHost", ping);
                $onlineParty.partyConnection.on("NewPartyWithHost", function (pong) {
                    if (pong == "hello") {
                        $onlineParty.isHost = true;
                    }
                })
            }

        } catch (e) {
            console.error(e.toString());
        };

    })();
};

Online_Party.prototype.makeOnlinePartyPortal = function () {
    $onlineParty.populatePlayerOptions();
    let partyPortal = new PartyPortalWindow(300, 300);
    $onlineParty.currentPartyPortal = partyPortal;
    $onlineParty.currentPartyPortal.clearCommandList();
    $onlineParty.currentPartyPortal.makeCommandList();
    $onlineParty.currentPartyPortal.setHandler('addPlayerToParty', this.addPlayerToParty.bind(this));    
    SceneManager._scene.addChild(partyPortal);
};

Online_Party.prototype.populatePlayerOptions = function () {
    let context = this;
    let players = $gameNetwork.networkMapEvents;
    $onlineParty.playerOptions = [];
    for (let key in players) {
        let player = players[key];
        $onlineParty.playerOptions.push(player);
    };
};


Online_Party.prototype.addPlayerToParty = function (evt) {
    console.log('score');
    let currentExtent = this.currentPartyPortal.currentExt();
    
};

Online_Party.prototype.newPartyAsHost = function () {

};

Online_Party.prototype.joinParty = function () {

};

Online_Party.prototype.createNewOnlinePartyMember = function () {

};