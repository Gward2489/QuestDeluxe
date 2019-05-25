(function () {

    // Add new property on BattleManager initialization
    //  to hold socket connection
    var initMembersAlias = BattleManager.prototype.initMembers;
    BattleManager.prototype.initMembers = function() {
        initMembersAlias.call(this);
        this.battleConnection = {};
    };

    // add function to battle manager to kick off battle connection
    BattleManager.prototype.createBattleConnection = function () {
        let connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5000/battleManagerHub")
        .build();
    
        this.battleConnection = connection;
        this.battleConnection.start();
    };

    // add function to battle manager to kill battle connection
    BattleManager.prototype.removeBattleConnection = function () {

        this.battleConnection.stop();
        this.battleConnection = {};
    };

    // to be called in game interpreter command 301. will check for online
    // party members and add them to the battle
    // ---
    // character events will already be present in onlinePartyMembers array
    // add these events to the array of characters events that will be passed into the
    // battle manager start event
    BattleManager.prototype.injectOnlinePartyMembers = function () {

        if ($gameNetwork.onlinePartyMembers.length > 0) {
            
            $gameNetwork.onlinePartyMembers.forEach(pm => {



            });

        }
    };



}) ();