    import {$gameNetwork} from "./onlineSystem";
    export {Scene_Map, Spriteset_Map, Game_Player, Game_Map, Game_NetworkPlayer}

    
    // Use this function to broadcat player location/sprite info to other players in map group
    // await connection.invoke("BroadcastToMapGroup", mapGroupName, groupMsg);
    
    // Use this function to add player to map group based on map name
    // await connection.invoke("AddToMapGroup", mapGroupName);
    
    // Use this function to remove player from map groups (when player leaves map room)
    // await connection.invoke("RemoveFromMapGroup", mapGroupName);
    
    // variable to hold data on other players in mapGroup
    
    // overload map socket creation function to handle adding player to map group initially and to
    // define function used to broadcast incoming player data to map

    
    const onMapLoadALias = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function () {
        onMapLoadALias.call(this);

        if ($gameMap._mapId !== $gameNetwork.currentMapId) {

            let playerData = $gameNetwork.GetPlayerCasterData();

            $gameNetwork.mapConnection.invoke("RemoveFromMapGroup", "mapRoom" + $gameNetwork.currentMapId, JSON.stringify(playerData));

            let targetDataEventIndexes = []; 
            for (let i = 0; i < $dataMap.events.length; i++) {
                if ($dataMap.events[i] !== null) {
                    if ($dataMap.events[i]._isNetworkPlayerEvent === true) {
                        targetDataEventIndexes.push(i);
                    }
                }
            }
    
            if (targetDataEventIndexes.length > 0) {
                targetDataEventIndexes.forEach(i => {
                    $dataMap.events.splice(i, 1);
                });
            }
    
            let targetMapEventIndexes = [];
            for (let i = 1; i < $gameMap._events.length; i ++) {
                if ($gameMap._events[i]._accountUserName) {
                    if ($gameMap._events[i]._isNetworkPlayerEvent === true) {
                        targetMapEventIndexes.push(i);
                    }
                }
            }
    
            if (targetMapEventIndexes.length > 0) {
                targetMapEventIndexes.forEach(i => {
                    $gameMap._events.splice(i, 1);
                });
            }
    
            let netEventsToRemove = [];
    
            let evs = $gameNetwork.networkMapEvents;
    
            for(let netEvent in evs) {
                if (evs.hasOwnProperty(netEvent)) {
                    if (evs[netEvent]._isNetworkPlayerEvent === true) {
                        netEventsToRemove.push(evs[netEvent]._accountUserName);
                    }
                }
            }
    
    
            if (netEventsToRemove.length > 0) {
                netEventsToRemove.forEach(netEvent => {
                    delete $gameNetwork.networkMapEvents[netEvent];
                })
            }
    
            SceneManager._scene._spriteset.clearAllNetworkPlayerEvents();

            $gameNetwork.currentMapId = $gameMap._mapId;

            $gameNetwork.mapConnection.invoke("AddToMapGroup", "mapRoom" + $gameNetwork.currentMapId, JSON.stringify(playerData));

        }
        $gameNetwork.game_loaded = true;
    };

    Spriteset_Map.prototype.clearNetworkPlayer = function(accountUserName) {
        for (let i = 0; i < this._characterSprites.length; i++) {
            let event = this._characterSprites[i]._character;
            if (event._accountUserName === accountUserName) {
                this._tilemap.removeChild(this._characterSprites[i]);
            }
        }
    };

    Spriteset_Map.prototype.clearAllNetworkPlayerEvents = function() {
        for (let i = 0; i < this._characterSprites.length; i++) {
            let event = this._characterSprites[i]._character;
            if (event._isNetworkPlayerEvent === true) {
                this._tilemap.removeChild(this._characterSprites[i]);
            }
        }
    };

    Game_Player.prototype.UpdateNetworkPlayer = function (data) {

        let userAccount = data.accountUserName;
        let netEvents = $gameNetwork.networkMapEvents;

        netEvents[userAccount].setMoveSpeed(data.moveSpeed);
        netEvents[userAccount].setMoveFrequency(data.moveFrequenzy);
        netEvents[userAccount].moveStraight(data.direction);

        if (netEvents[userAccount].x!==data.x || netEvents[userAccount].y!==data.y){
            netEvents[userAccount].setPosition(data.x, data.y);
        }

        netEvents[userAccount]._characterName = data.characterName;
        netEvents[userAccount]._characterIndex = data.characterIndex;

    };

    // overload MV function to broadcast player movement to map group. logic to handle mapGroup changes also here
    Game_Player.prototype.moveByInput = function() {
        if (!this.isMoving() && this.canMove()) {
            var direction = this.getInputDirection();
            if (direction > 0) {
                $gameTemp.clearDestination();
            } else if ($gameTemp.isDestinationValid()){
                var x = $gameTemp.destinationX();
                var y = $gameTemp.destinationY();
                direction = this.findDirectionTo(x, y);
            }

            if (direction > 0) {

                this.executeMove(direction);
                if ($gameNetwork.currentMapId !== $gameMap._mapId) {
                    let playerData = $gameNetwork.GetPlayerCasterData();
                    try {
                        $gameNetwork.mapConnection.invoke("RemoveFromMapGroup", "mapRoom" + $gameNetwork.currentMapId, JSON.stringify(playerData));
                    }
                    catch (e) {
                        console.error(e.toString());
                    }
                    $gameNetwork.currentMapId = $gameMap._mapId;

                    try {
                        $gameNetwork.mapConnection.invoke("AddToMapGroup", "mapRoom" + $gameNetwork.currentMapId, JSON.stringify(playerData));
                    }
                    catch (e) {
                        console.error(e.toString());
                    }
                };
                
                let playerData = $gameNetwork.GetPlayerCasterData();                
                let mapGroupName = "mapRoom" + $gameMap._mapId 
                $gameNetwork.mapConnection.invoke("BroadcastToMapGroup", mapGroupName, JSON.stringify(playerData));
            }
        }
    };
    

    Game_Player.prototype.seedNewPlayerEvent = function (newPlayerX, newPlayerY, playerAccountName) {
        let newEventId = $dataMap.events.length;
        let emptyEvent = `{"id":${newEventId},"name":"${playerAccountName}","note":"","pages":[{"conditions":{"actorId":1,"actorValid":false,"itemId":1,"itemValid":false,"selfSwitchCh":"A","selfSwitchValid":false,"switch1Id":1,"switch1Valid":false,"switch2Id":1,"switch2Valid":false,"variableId":1,"variableValid":false,"variableValue":0},"directionFix":false,"image":{"characterIndex":0,"characterName":"","direction":2,"pattern":0,"tileId":0},"list":[{"code":0,"indent":0,"parameters":[]}],"moveFrequency":3,"moveRoute":{"list":[{"code":0,"parameters":[]}],"repeat":true,"skippable":false,"wait":false},"moveSpeed":3,"moveType":0,"priorityType":0,"stepAnime":false,"through":false,"trigger":0,"walkAnime":true}],"x":${newPlayerX},"y":${newPlayerY},"meta":{},"_isNetworkPlayerEvent":true}`;
        $dataMap.events.push(JSON.parse(emptyEvent));
        return newEventId;
    }

    
    //logic to add new player instance to networkMapEvents
    Game_Map.prototype.addNetworkPlayer = function(x, y, playerAccountName) {
        let newPlayerEventId = Game_Player.prototype.seedNewPlayerEvent(x, y, playerAccountName);
        let newPlayerMapId = this._events.length;

        this._events[newPlayerMapId] = new Game_NetworkPlayer(this._mapId, newPlayerEventId, x, y);
        this._events[newPlayerMapId]._accountUserName = playerAccountName;
        this._events[newPlayerMapId]._isNetworkPlayerEvent = true;
        SceneManager._scene._spriteset.createNetworkPlayer(newPlayerMapId, playerAccountName);
        return this._events[newPlayerMapId];
    };
    
    // logic to create new player instance for networkMapEvents
    Spriteset_Map.prototype.createNetworkPlayer = function(targetIndex, playerAccountName) {
        let event = $gameMap._events[targetIndex];
        var sId = this._characterSprites.length;
        this._characterSprites[sId] = new Sprite_Character(event);
        this._characterSprites[sId]._accountUserName = playerAccountName;
        this._characterSprites[sId].update();
        this._tilemap.addChild(this._characterSprites[sId]);
    };

    // Logic to create a new character instance that will be used to broadcast to the map
    function Game_NetworkPlayer() {
        this.initialize.apply(this, arguments);
    }
    
    Game_NetworkPlayer.prototype = Object.create(Game_Event.prototype);
    Game_NetworkPlayer.prototype.constructor = Game_NetworkPlayer;
    
    Game_NetworkPlayer.prototype.initialize = function(mapId, eventId,x,y) {
        Game_Event.prototype.initialize.call(this,mapId,eventId);
        this._isNetworkPlayer = true;
        this.setPosition(x,y);
    };
    
