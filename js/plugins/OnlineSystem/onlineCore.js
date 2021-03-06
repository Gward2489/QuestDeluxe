var Imported = Imported || {};
Imported.OnlineCore = true;

import {$gameNetwork, $onlineParty} from "./onlineSystem"
import { Game_Map } from "./onlineMapBroadcaster";
export {Game_Network};

    /*:
     * @plugindesc Plugin to support online play.
     * @author Garrett Ward
     *
     * @help TBD
     *
     */
    
    function Game_Network() {
        this.initialize.apply(this, arguments);
    }

    
    Game_Network.prototype.initialize = function() {
        this.apiUrl = 'http://localhost:5000/api';
        this.token = '';
        this.userEmail = "";
        this.userAccountName = "";
        this.currentMapId = 0; 
        this.mapConnection = {};
        this.networkMapEvents = {};
        this.game_loaded = false;
        this.loadedGames = [];
    };

    Game_Network.prototype.connectMapSocketAfterLogin = function() {
        let connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5000/gameMapHub")
        .build();
        $gameNetwork.mapConnection = connection;
        (async () => {
            try {
                await $gameNetwork.mapConnection.start();
                let playerData = $gameNetwork.GetPlayerCasterData();

                $gameNetwork.mapConnection.invoke("AddToMapGroup", "mapRoom" + $gameNetwork.currentMapId, JSON.stringify(playerData));
    
                
                $gameNetwork.mapConnection.on("NewPlayerOnMap", function (playerData) {
                    let data = JSON.parse(playerData);
                    if (data.x === 0 || data.y === 0) {
                        data.x = 1,
                        data.y = 1
                    };
                    let newNetworkPlayer = $gameMap.addNetworkPlayer(data.x, data.y, data.accountUserName, data.charName);
                    $gameNetwork.networkMapEvents[data.accountUserName] = newNetworkPlayer;
                    $onlineParty.members.push(newNetworkPlayer);

                    Game_Player.prototype.UpdateNetworkPlayer(data);
                    let pingData = Game_Network.prototype.GetPlayerCasterData();
                    $gameNetwork.mapConnection.invoke("BroadcastToMapGroup", "mapRoom" + $gameNetwork.currentMapId, JSON.stringify(pingData));
                });

                $gameNetwork.mapConnection.on("PlayerMapUpdate", function (playerData) {

                    if (!SceneManager._scene._spriteset || SceneManager._scene instanceof Scene_Battle) {              
                        return;
                    } 
        
                    let data = JSON.parse(playerData);
                    
                    if ($gameNetwork.networkMapEvents[data.accountUserName]) {
                        Game_Player.prototype.UpdateNetworkPlayer(data);
                    } else {
                        console.log(data.charName);
                        let newNetworkPlayer = $gameMap.addNetworkPlayer(data.x, data.y, data.accountUserName, data.charName);
                        $gameNetwork.networkMapEvents[data.accountUserName] = newNetworkPlayer;
                        $onlineParty.members.push(newNetworkPlayer);
                        Game_Player.prototype.UpdateNetworkPlayer(data);
                    }

                });

                $gameNetwork.mapConnection.on("RemovePlayerFromMap", function (playerData) {

                    let data = JSON.parse(playerData);

                    let targetDataEventIndex = 0; 
                    for (let i = 0; i < $dataMap.events.length; i++) {
                        if ($dataMap.events[i] !== null) {
                            if ($dataMap.events[i].name === data.accountUserName) {
                                targetDataEventIndex = i;
                            }
                        }
                    }
                    $dataMap.events.splice(targetDataEventIndex, 1);

                    let targetMapEventIndex = 0;
                    for (let i = 1; i < $gameMap._events.length; i ++) {
                        if ($gameMap._events[i]._accountUserName) {
                            if ($gameMap._events[i]._accountUserName === data.accountUserName) {
                                targetMapEventIndex = i;
                            }
                        }
                    }
                    $gameMap._events.splice(targetMapEventIndex, 1);

                    delete $gameNetwork.networkMapEvents[data.accountUserName];
                    SceneManager._scene._spriteset.clearNetworkPlayer(data.accountUserName);

                });

            }
            catch (e) {
                console.error(e.toString());
            }
        })();
    }
    
    Game_Network.prototype.CaptureLoginResponse = function (responseData) {
        $gameNetwork.token = responseData.token;
        $gameNetwork.userEmail = responseData.email;
        $gameNetwork.userAccountName = responseData.user;
    }

    Game_Network.prototype.GetPlayerCasterData = function () {

        let playerData = {
            accountUserName: $gameNetwork.userAccountName,
            charName: $gameParty.leader()._name,
            direction: $gamePlayer._direction,
            x: $gamePlayer._x,
            y: $gamePlayer._y,
            moveSpeed: $gamePlayer._moveSpeed,
            moveFrequenzy: $gamePlayer._moveFrequency,
            characterName: $gamePlayer._characterName,
            characterIndex: $gamePlayer._characterIndex
        }
        return playerData;
    };
        
    Game_Network.prototype.LoadGameFilesFromServer = function(userEmail, callback) {
        $.get($gameNetwork.apiUrl + `/GameData/${userEmail}`, function(response) {
            console.log(response);
            callback(response);
        }).fail(function() {
            window.alert('Load failed');
        });
    };

    Game_Network.prototype.CreateNewUser = function(userData, callback) {
        $.ajax({
            url: $gameNetwork.apiUrl + `/Accounts/register`,
            type: "POST",
            data: userData,
            contentType: "application/json",
            success: function (r) {
                callback();
            },
            error: function (r) {
                console.log(r);
            }
        })
    }

    Game_Network.prototype.LogUserIn = function(userData, callback) {
        $.ajax({
            url: $gameNetwork.apiUrl + `/Accounts/login`,
            type: "POST",
            data: userData,
            contentType: "application/json",
            success: function (r) {
                $gameNetwork.userEmail = r.email;
                Game_Network.prototype.CaptureLoginResponse(r);
                callback();
            },
            error: function (r) {
                console.log(r);
            }
        })
    }

    Game_Network.prototype.ClassSelect = function (savefile, classChoice, charName) {

        let newActor = [];
        
        if (classChoice === 'Clansmen') {
            newActor = [null,
                {"altClassName":`${classChoice}`,"id":1,"battlerName":"Actor1_1","characterIndex":0,"characterName":"Actor1","classId":1,"equips":[1,1,2,3,0],"faceIndex":0,"faceName":"Actor1","traits":[],"initialLevel":1,"maxLevel":99,"name":`${charName}`,"nickname":"","note":"","profile":""}
            ];
            
        } else if (classChoice === 'Big Hat') {
            newActor = [null,
                {"altClassName":`${classChoice}`,"id":2,"battlerName":"Actor2_5","characterIndex":4,"characterName":"Actor2","classId":3,"equips":[3,0,0,0,0],"faceIndex":4,"faceName":"Actor2","traits":[],"initialLevel":1,"maxLevel":99,"name":`${charName}`,"nickname":"","note":"","profile":""}
            ]
            
            
        } else if (classChoice === 'Divine') {
            newActor = [null,
                {"altClassName":`${classChoice}`,"id":4,"battlerName":"Actor2_4","characterIndex":3,"characterName":"Actor3","classId":4,"equips":[4,0,0,0,0],"faceIndex":3,"faceName":"Actor3","traits":[],"initialLevel":1,"maxLevel":99,"name":`${charName}`,"nickname":"","note":"","profile":""}
            ]
            
            
        } else if (classChoice === 'Mercenary') {
            newActor = [null,
                {"altClassName":`${classChoice}`,"id":3,"battlerName":"Actor1_7","characterIndex":6,"characterName":"Actor1","classId":2,"equips":[2,0,0,0,0],"faceIndex":6,"faceName":"Actor1","traits":[],"initialLevel":1,"maxLevel":99,"name":`${charName}`,"nickname":"","note":"","profile":""}
            ]
            
        }
        
        $dataActors = newActor;
        let actorsArray = new Game_Actors();
        let gameActor = new Game_Actor(1);
        let initializedActor = Object.assign(gameActor, newActor[1]);
        newActor[1] = initializedActor;
        actorsArray._data = newActor;
        
        savefile.actors = actorsArray;
        savefile.dataActors = $dataActors;

        return savefile;
    }

    Game_Network.prototype.LoadSavedGame = function (contents) {

        DataManager.createGameObjects();
        DataManager.extractSaveContents(contents);
        $dataActors = contents.dataActors;

        let actorsArray = new Game_Actors();
        let gameActor = new Game_Actor(1);
        actorsArray._data = [null, gameActor];
        $gameActors = actorsArray;
                
        $gameNetwork.currentMapId = $dataSystem.startMapId;
                
        Graphics.frameCount = 0;
        
        SceneManager.goto(Scene_Map);

        $gameNetwork.connectMapSocketAfterLogin();

    }

    Game_Network.prototype.CreateNewGame = function (ownerEmail, classChoice, callback, charName) {
        let saveContents = DataManager.makeSaveContents();
        const newgame = $gameNetwork.ClassSelect(saveContents, classChoice, charName);
        let json = JsonEx.stringify(newgame);
        // let data = LZString.compressToBase64(json);

        // console.log(data);
        console.log("yippe");

        $.ajax({
            url: $gameNetwork.apiUrl + `/GameData/SaveNewGame/${ownerEmail}`,
            type: "POST",
            data: json,
            processData: false,
            contentType: "application/json",
            success: function () {
                callback();
            }
        });
    };
