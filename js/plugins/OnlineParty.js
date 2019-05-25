(function () {

    function Online_Party() {
        this.initialize.apply(this, arguments);
    }

    Online_Party.prototype.initialize = function () {
        this.members = [];
        this.partyConnection = {};
        this.host = false; 
    };

    Online_Party.prototype.makeNewPartyConnection = function (callback) {

        let connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5000/onlinePartyHub")
        .build();

        $onlineParty.partyConnection = connection;
        (async () => {
            try {
                $onlineParty.partyConnection.start();
                $onlineParty.partyConnection.invoke("AddToParty", )

                
            } catch (e) {
                console.error(e.toString());
            };

        })();
    };

    Online_Party.prototype.createNewPartyAsHost = function () {



    };

    Online_Party.prototype.createNewOnlinePartyMember = function () {


    };


}) ();