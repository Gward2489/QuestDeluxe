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
    this.partyActors = {};
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
                    let party = $onlineParty.createNewOnlineParty(partyString);
                    $onlineParty.currentOnlineParty = party
                    SceneManager._scene.addChild(new Online_Party_Window);
                    $gameMessage.add("Your Party Was Created !!");
                });

                $onlineParty.partyConnection.on("NewPlayerInParty", function (partyString) {
                    $onlineParty.isHost = false;
                    let party = $onlineParty.createNewOnlineParty(partyString);
                    $onlineParty.currentOnlineParty = party;
                    $onlineParty.sendPlayerData($gameNetwork.userAccountName);
                });

                $onlineParty.partyConnection.on("GameActorDataUpdate", function (actorString) {

                    let newGameActorData = JsonEx.parse(actorString);
                    $onlineParty.partyActors[newGameActorData.userAccountName] = newGameActorData;
                    console.log($onlineParty.partyActors);

                });

                $onlineParty.partyConnection.on("PartyMemberDropped", function (disconnectedUser) {

                    console.log(disconnectedUser + " has dropped");
                    // logic to adjust party on client side here ... 

                });

                $onlineParty.partyConnection.invoke("AddToPartyAsHost", `party:${$gameNetwork.userAccountName}`, ping);

            } else {

                $onlineParty.partyConnection.on("GameActorDataUpdate", function (actorString) {

                    let newGameActorData = JsonEx.parse(actorString);
                    $onlineParty.partyActors[newGameActorData.userAccountName] = newGameActorData;
                    console.log($onlineParty.partyActors);

                });

                $onlineParty.partyConnection.on("NewPlayerInParty", function (partyString) {
                    $onlineParty.isHost = false;
                    let party = $onlineParty.createNewOnlineParty(partyString);
                    $onlineParty.currentOnlineParty = party;
                    $onlineParty.sendPlayerData(partyHost);
                    console.log($onlineParty.partyActors);
                });

                $onlineParty.partyConnection.on("PartyMemberDropped", function (disconnectedUser) {

                    // logic to adjust party on client side here ... 
                    console.log(disconnectedUser + " has dropped");

                });

                $onlineParty.partyConnection.on("HostDropped", function (partyName) {

                    // logic to disband party on host disconnect

                    console.log(partyName + "'s host has dropped");

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

Online_Party.prototype.sendPlayerData = function (hostName) {

    let rawActorData = $gameActors._data[1];
    rawActorData.userAccountName = $gameNetwork.userAccountName;
    const actorData =  JsonEx.stringify(rawActorData);

    $onlineParty.partyConnection.invoke("SendGameActorData", hostName, actorData);

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

    // this.drawTextEx(`${$gameNetwork.userAccountName}`, 2, 2)
    this.makePartyMembersList();
}

Online_Party_Window.prototype.makePartyMembersList = function () {
    
    let members = [];
    let counter = 0;
    for (let prop in $onlineParty.currentOnlineParty) {

        if (prop.toLowerCase().startsWith("seat")) {

            let displayObj = {
                name: $onlineParty.currentOnlineParty[prop],
                x: 2,
                y: counter + 2
                
            };
            if (displayObj.name !== null ) {
                members.push(displayObj);
                
            }

        } else if (prop.toLowerCase() == "partyname") {
            
            let displayObj = {
                name: $onlineParty.currentOnlineParty[prop],
                x: 2,
                y: counter + 2
                
            };

            if (displayObj.name !== null ) {
                members.push(displayObj);

            }

        };

        counter ++;
    };

    members.forEach(m => {

        this.drawTextEx(`${m.name}`, m.x, m.y)
    })
}

