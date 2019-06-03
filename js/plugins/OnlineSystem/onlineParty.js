export {Online_Party, Online_Party_Window};
import {$onlineParty, $gameNetwork} from "./onlineSystem";
import {PartyPortalWindow} from "./partyPortal";
import axios from "axios";

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
    this.currentOnlineParty = {};
    this.currentPartyPortal = {};
};

Online_Party.prototype.makeNewPartyConnection = function (asHost, partyHost) {

    let connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/onlinePartyHub", {
        accessTokenFactory: () => {
            return $gameNetwork.token;
        }
    })
    .build();

    $onlineParty.partyConnection = connection;
    (async () => {
        try {
            await $onlineParty.partyConnection.start();

            if (asHost) {

                let ping = "hello";
                $onlineParty.partyConnection.on("NewPartyWithHost", function (partyString) {
                    $onlineParty.isHost = true;
                    $gameMessage.add("Your Party Was Created !!");
                    SceneManager._scene.addChild(new Online_Party_Window);
                    let party = $onlineParty.createNewOnlineParty(partyString);
                    $onlineParty.currentOnlineParty = party
                    console.log(party);
                });

                $onlineParty.partyConnection.on("NewPlayerInParty", function (partyString) {
                    $onlineParty.isHost = false;
                    let party = $onlineParty.createNewOnlineParty(partyString);
                    $onlineParty.currentOnlineParty = party;
                    console.log(party);
                });

                $onlineParty.partyConnection.invoke("AddToPartyAsHost", `party:${$gameNetwork.userAccountName}`, ping);
            } else {
                $onlineParty.partyConnection.on("NewPlayerInParty", function (partyString) {
                    $onlineParty.isHost = false;
                    let party = $onlineParty.createNewOnlineParty(partyString);
                    $onlineParty.currentOnlineParty = party;
                    console.log(party);
                });
                $onlineParty.partyConnection.invoke("AddToParty", $gameNetwork.userAccountName, partyHost);
            };

        } catch (e) {
            console.error(e.toString());
            $gameMessages.add("Your Party failed to create ")
        };

    })();
};

Online_Party.prototype.createNewOnlineParty = function (partyString) {
    let partyObj = JSON.parse(partyString);
    return partyObj;
};


Online_Party.prototype.makeOnlinePartyPortal = function () {
    // $onlineParty.populatePlayerOptions();

    axios.get($gameNetwork.apiUrl + '/parties', { contentType: "application/json"})
    .then(r => {
        $onlineParty.partyOptions = r.data;
        let partyPortal = new PartyPortalWindow(300, 300);
        $onlineParty.currentPartyPortal = partyPortal;
        $onlineParty.currentPartyPortal.setHandler('joinParty', this.addPlayerToParty.bind(this)); 
        SceneManager._scene.addChild(partyPortal);
    });
    
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
    $onlineParty.makeNewPartyConnection(false, currentExtent);
};

Online_Party.prototype.newPartyAsHost = function () {
    let onlineGroup = {
        host: $gameNetwork.userAccountName,
        players: [$gameNetwork.userAccountName]
    };

    $onlineParty.partiesSeeking.push(onlineGroup);
    $onlineParty.makeNewPartyConnection(true);
};

Online_Party.prototype.newPlayerInParty = function (newMemberName) {




};

function Online_Party_Window() {
    this.initialize.apply(this, arguments);
}

Online_Party_Window.prototype = Object.create(Window_Base.prototype);
Online_Party_Window.prototype.constructor = Online_Party_Window;

Online_Party_Window.prototype.initialize = function() {
    Window_Base.prototype.initialize.call(this, 0, 0, 200, 100);

    let partyString = "";

    this.drawTextEx(`${$gameNetwork.userAccountName}`, 2, 2)
}

