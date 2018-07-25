var Imported = Imported || {};
Imported.OnlineCore = true;

    /*:
     * @plugindesc Plugin to support online play.
     * @author Garrett Ward
     *
     * @help TBD
     *
     */
    
    
    let $gameNetwork = null;

    let MageCore_CreateGameObj = DataManager.createGameObjects;
    DataManager.createGameObjects = function () {
        MageCore_CreateGameObj.call(this);
        $gameNetwork = $gameNetwork || new Game_Network();
    };

    function Game_Network() {
        this.initialize.apply(this, arguments);
    }

    
    
    
    Game_Network.prototype.initialize = function() {
        this.apiUrl = 'http://localhost:5000/api';
        this.token = '';
        this.userEmail = "";
    };
    
    Game_Network.prototype.CaptureLoginResponse = function (responseData) {
        $gameNetwork.token = responseData.token;
        $gameNetwork.userEmail = responseData.user;
    }
        
    Game_Network.prototype.LoadGameFilesFromServer = function(userEmail, callback) {
        $.get($gameNetwork.apiUrl + `/GameData/${userEmail}`, function(response) {
            callback(response);
        }).fail(function() {
            window.alert('Load failed');
        });
    };

    Game_Network.prototype.SaveGameToServer = function(GameFile) {
        $.ajax({
            url: $gameNetwork.apiUrl + `/GameData/SaveGame`,
            type: "PUT",
            data: GameFile,
            contentType: "application/json"
        })
    }

    Game_Network.prototype.SaveNewGameToServer = function(GameFile, ownerEmail) {
        $.ajax({
            url: $gameNetwork.apiUrl + `/GameData/SaveNewGame/${ownerEmail}`,
            type: "POST",
            data: GameFile,
            contentType: "application/json"
        })
    }

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

    Game_Network.prototype.ClassSelect = function (savefile, classChoice) {

        if (classChoice === 'Clansmen') {
            let newActor = [null,
                {"id":1,"battlerName":"Actor1_1","characterIndex":0,"characterName":"Actor1","classId":1,"equips":[1,1,2,3,0],"faceIndex":0,"faceName":"Actor1","traits":[],"initialLevel":1,"maxLevel":99,"name":"Todd of Toddington","nickname":"","note":"","profile":""}
                ];
    
            savefile['$dataActors'] = newActor;
        } else if (classChoice === 'Big Hat') {
            let newActor = [null,
                {"id":2,"battlerName":"Actor2_5","characterIndex":4,"characterName":"Actor2","classId":3,"equips":[3,0,0,0,0],"faceIndex":4,"faceName":"Actor2","traits":[],"initialLevel":1,"maxLevel":99,"name":"Jeb","nickname":"","note":"","profile":""}
            ]

            savefile['$dataActors'] = newActor;
        } else if (classChoice === 'Divine') {
            let newActor = [null,
                {"id":3,"battlerName":"Actor1_7","characterIndex":6,"characterName":"Actor1","classId":2,"equips":[2,0,0,0,0],"faceIndex":6,"faceName":"Actor1","traits":[],"initialLevel":1,"maxLevel":99,"name":"Jordie the Jord","nickname":"","note":"","profile":""}
            ]

            savefile['$dataActors'] = newActor;
        } else if (classChoice === 'Mercenary') {
            let newActor = [null,
                {"id":4,"battlerName":"Actor2_4","characterIndex":3,"characterName":"Actor3","classId":4,"equips":[4,0,0,0,0],"faceIndex":3,"faceName":"Actor3","traits":[],"initialLevel":1,"maxLevel":99,"name":"Barbara the blessed","nickname":"","note":"","profile":""}
            ]

            savefile['$dataActors'] = newActor;
        }

        return savefile;
    }

    Game_Network.prototype.CaptureCoreGameMetaData = function () {
        $gameNetwork.dataFiles = [];
        var test = DataManager.isBattleTest() || DataManager.isEventTest();
        var prefix = test ? 'Test_' : '';
        for (var i = 0; i < DataManager._databaseFiles.length; i++) {
            var name = DataManager._databaseFiles[i].name;
            var src = DataManager._databaseFiles[i].src;
            $gameNetwork.dataFiles.push([name, prefix + src]);
        }
        if (DataManager.isEventTest()) {
            $gameNetwork.dataFiles.push(['$testEvent', prefix + 'Event.json']);
        }
    }

    Game_Network.prototype.CreateNewSaveFile = function (ownerEmail, classChoice) {

        let saveFile = {};
        let counter = 0;
        let cap = $gameNetwork.dataFiles.length;

        $gameNetwork.dataFiles.forEach(function (f) {
            let xhr = new XMLHttpRequest();
            let url = 'data/' + f[1];
            xhr.open('GET', url);
            xhr.overrideMimeType('application/json');
            xhr.onload = function() {
                if (xhr.status < 400) {
                    counter ++ ;
                    saveFile[f[0]] = JSON.parse(xhr.responseText);
                    if (counter === cap) {

                        let GameFile = $gameNetwork.ClassSelect(saveFile, classChoice);
                        let json = JSON.stringify(GameFile);
                        $.ajax({
                            url: $gameNetwork.apiUrl + `/GameData/SaveNewGame/${ownerEmail}`,
                            type: "POST",
                            data: json,
                            contentType: 'application/json'
                        })
                        counter++
                    };
                }
            };
            xhr.onerror = this._mapLoader || function() {
                DataManager._errorUrl = DataManager._errorUrl || url;
            };
            xhr.send();
        });
        
    }

    Game_Network.prototype.PopulateDatabase = function (db) {
        for (let dataType in db) {
            window[dataType] = db[dataType];
            DataManager.onLoad(window[dataType]) 
        }
    };

    DataManager.loadDataFile = function(name, src) {
        var xhr = new XMLHttpRequest();
        var url = 'data/' + src;
        xhr.open('GET', url);
        xhr.overrideMimeType('application/json');
        xhr.onload = function() {
            if (xhr.status < 400) {
                window[name] = JSON.parse(xhr.responseText);
                DataManager.onLoad(window[name]);
            }
        };
        xhr.onerror = this._mapLoader || function() {
            DataManager._errorUrl = DataManager._errorUrl || url;
        };
        window[name] = null;
        xhr.send();
    };
    
    // TODO: Implement Identity check to load character files that correspond to current user. 


    DataManager.loadDatabase = function() {
    
        var test = this.isBattleTest() || this.isEventTest();
        var prefix = test ? 'Test_' : '';
        for (var i = 0; i < this._databaseFiles.length; i++) {
            var name = this._databaseFiles[i].name;
            var src = this._databaseFiles[i].src;
            this.loadDataFile(name, prefix + src);
        }
        if (this.isEventTest()) {
            this.loadDataFile('$testEvent', prefix + 'Event.json');
        }
    }




