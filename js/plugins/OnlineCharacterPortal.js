var Imported = Imported || {};
Imported.OnlineCore = true;

(function () {
/*:
 * @plugindesc Plugin used with Online Core to establish User Login/Registration and Character Creation and Selection
 * @author Garrett Ward
 *
 * @help
 *
 */


function QuestDeluxePortal () {
    this.initialize.apply(this, arguments)
}

QuestDeluxePortal.prototype = Object.create(Scene_Base.prototype);
QuestDeluxePortal.prototype.constructor = QuestDeluxePortal;

QuestDeluxePortal.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
}

QuestDeluxePortal.prototype.reBindInput = function() {
    Input.initialize();
};

QuestDeluxePortal.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.createBackground();
};

QuestDeluxePortal.prototype.start = function () {
    Scene_Base.prototype.start.call(this);
    SceneManager.clearStack();
    this.playTitleMusic();
    this.startFadeIn(this.fadeSpeed(), false);
    this.LoginForm();
}

QuestDeluxePortal.prototype.update = function() {
    Scene_Base.prototype.update.call(this);
};

QuestDeluxePortal.prototype.isBusy = function() {
    return Scene_Base.prototype.isBusy.call(this);
};

QuestDeluxePortal.prototype.terminate = function() {
    Scene_Base.prototype.terminate.call(this);
    SceneManager.snapForBackground();
};

QuestDeluxePortal.prototype.createNewSaveFile = function (newCharacter) {

    let contents = {}

    contents.system       = $gameSystem;
    contents.screen       = $gameScreen;
    contents.timer        = $gameTimer;
    contents.switches     = $gameSwitches;
    contents.variables    = $gameVariables;
    contents.selfSwitches = $gameSelfSwitches;
    contents.actors       = newCharacter;
    contents.party        = $gameParty;
    contents.map          = $gameMap;
    contents.player       = $gamePlayer;

    let jsonData = JSON.stringify(contents);

    return jsonData;

};

QuestDeluxePortal.prototype.RegistrationSuccess = function() {
    let context = this;
    let screenWidth = (Graphics.boxWidth - (Graphics.boxWidth / 3));
    $('#ErrorPrinter').html(
        `<div class="registrationSuccessWrapper" style="width:${screenWidth}px>
            <div class="registrationSuccessInnerWrapper">
                <div class="registrationSuccessTextWrapper">
                    <div class="registrationSuccessText">
                        REGISTRATION SUCCESSFUL! LOG IN!
                    </div>
                </div>
                <div class="registrationSuccessButtonWrapper">
                    <button class="registrationSuccessButton">
                        LOG IN
                    </button>
                </div>
            </div>
        </div>
        `
    );
    $('.registrationSuccessButton').click(function () {
        context.LoginForm();
    })
}

QuestDeluxePortal.prototype.RegistrationForm = function() {
    let context = this;
    let screenWidth = (Graphics.boxWidth - (Graphics.boxWidth / 3));
    $("#ErrorPrinter").html(
        `<div id="RegisterForm" class="panel panel-primary" style="width:${screenWidth}px>
            <div class="registrationWrapper>
                <div class="emailWrapper">
                    <div class="emailInput">
                        <input class="emailText" placeholder="email">
                    </div>
                </div>
                <div class="accountNameWrapper">
                    <div class="accountNameInput">
                        <input class="accountNameText" placeholder="user name">
                    </div>
                </div>
                <div class=passwordWrapper">
                    <div class="passwordInput">
                        <input class="passwordText" type="password" placeholder="password">
                    </div>
                </div>
                <div class="registerButtonWrapper">
                    <div class="registerButton">
                        <button class="registerSubmitButton">
                            REGISTER NOW
                        </button>
                    </div>
                </div>
                <div class="toLoginButtonWrapper">
                    <div class="toLoginButton">
                        <button class="toLoginSubmitButton">
                            LOGIN PORTAL
                        </button>
                    </div>
                </div>
            </div>
        </div>`
    )

    let scrapeRegistrationForm = function () {
        let email = $('.emailText').val();
        let username = $('.accountNameText').val();
        let password = $('.passwordText').val();

        let registrationData = {
            accountName: username,
            password: password,
            email: email
        }
        let data = JSON.stringify(registrationData);
        return data
    };

    $('.registerSubmitButton').click(function (e) {
        let data = scrapeRegistrationForm();
        $gameNetwork.CreateNewUser(data, context.RegistrationSuccess);
    });

    $('.toLoginButton').click(function (e) {
        context.LoginForm();
    });
}

QuestDeluxePortal.prototype.LoginForm = function() {
    let context = this;
    let screenWidth = (Graphics.boxWidth - (Graphics.boxWidth / 3));
    $("#ErrorPrinter").html(
        `<div id="LoginForm" class="panel panel-primary" style="width:${screenWidth}px>
            <div class="LoginWrapper>
                <div class="loginEmailWrapper">
                    <div class="loginEmailInput">
                        <input class="loginEmailText" placeholder="email">
                    </div>
                </div>
                <div class=loginPasswordWrapper">
                    <div class="loginPasswordInput">
                        <input class="loginPasswordText" placeholder="password" type="password">
                    </div>
                </div>
                <div class="loginButtonWrapper">
                    <div class="loginButton">
                        <button class="loginSubmitButton">
                            LOGIN
                        </button>
                    </div>
                </div>
                <div class="toRegisterWrapper">
                    <div class="toRegisterButton">
                        <button class="toRegisterSubmitButton">
                            SIGN UP!
                        </button>
                    </div>
                </div>
            </div>
        </div>`
    )

    let scrapeLoginInfo = function () {
        let email = $('.loginEmailText').val();
        let password = $('.loginPasswordText').val();

        let loginData = {
            email: email,
            password: password
        };

        let data = JSON.stringify(loginData);
        return data;
    }

    $('.loginSubmitButton').click(function (e) {
        let data = scrapeLoginInfo();
        $gameNetwork.LogUserIn(data, context.CharacterSelect);
    });

    $('.toRegisterSubmitButton').click(function (e) {
        context.RegistrationForm();
    });
}

QuestDeluxePortal.prototype.CharacterSelect = function() {
    let context = this;
    let screenWidth = (Graphics.boxWidth - (Graphics.boxWidth / 3));
    $("#ErrorPrinter").html(
        `<div id="CharacterSelectScreen" class="panel panel-primary" style="width:${screenWidth}px>
            <div class="optionsButtonsWrapper">
                <div class="optionsButtonsRow">
                    <div class="logoutButtonWrapper">
                        <button class="logoutButton">
                            LOG OUT
                        </button>
                    </div>
                    <div class="newCharacterButtonWrapper">
                        <button class="newCharacterButton">
                            NEW CHARACTER
                        </button>
                    </div>
                    <div class="accountOptionsWrapper">
                        <button class="accountOptionsButton">
                            OPTIONS
                        </button>
                    </div>
                </div>
            </div>
            <div class="charactersTableWrapper">
                <div class="charactersTableContainer">
                    <table style="width:100%" class="charactersTable">
                        <tr>
                            <th>Level</th> 
                            <th>Class</th>
                            <th>Character Name</th>
                        </tr>
                        <tr>
                            <td>17</td>
                            <td>Mage</td> 
                            <td>Jordie</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>`
    )

    let printGames = function (response) {
        let count = 1;
        response.forEach(d => {
            $('.charactersTable').append(` 
            <tr>
                <td><button class=game${count}>go go go</button></td>
                <td>Mage 22</td> 
                <td>Jordie hmmmm</td>
            </tr>
            `);
            $(`.game${count}`).click( function () {

                $("#ErrorPrinter").html('')
                $gameNetwork.PopulateDatabase(d);
                DataManager.createGameObjects();
                $gameParty.setupStartingMembers();
                $gamePlayer.reserveTransfer($dataSystem.startMapId,
                    $dataSystem.startX, $dataSystem.startY);
                Graphics.frameCount = 0;
                SceneManager.goto(Scene_Map);
            });
            count ++;
        });
    }

    $gameNetwork.LoadGameFilesFromServer($gameNetwork.userEmail, printGames);

    $('.newCharacterButton').click( function () {
        QuestDeluxePortal.prototype.NewCharacter();
    });
}


QuestDeluxePortal.prototype.runLoadedFile = function (contents) {
    
    
    Object.assign($gameSystem, contents.system);
    Object.assign($gameScreen, contents.screen);
    Object.assign($gameTimer, contents.timer);
    Object.assign($gameSwitches, contents.switches);
    Object.assign($gameVariables, contents.variables);
    Object.assign($gameSelfSwitches, contents.selfSwitches);
    Object.assign($gameActors, contents.actors);
    Object.assign($gameParty, contents.party);
    Object.assign($gameMap, contents.map);
    Object.assign($gamePlayer, contents.player);

}

QuestDeluxePortal.prototype.NewCharacter = function() {
    let context = this;
    let screenWidth = (Graphics.boxWidth - (Graphics.boxWidth / 3));
    $("#ErrorPrinter").html(
        `<div id="NewCharacterScreen" class="panel panel-primary" style="width:${screenWidth}px>
            <div class="infoTextWrapper">
                <div class="infoTextInnerWrapper">
                    <div class="infoText">
                        ENTER A CHARACTER NAME AND SELECT YOUR BASE CLASS
                    </div>
                </div>
            </div>

            <div class="characterNameWrapper">
                <div class="characterNameInput">
                    <input class="characterNameInputText">
                </div>
            </div>

            <div class="clansmanClassWrapper">
                <div class="clansmanClassInnerWrapper">
                    <button class="clansmenButton">
                        CLANSMEN
                    </button>
                </div>
            </div>

            <div class="bighatClassWrapper">
                <div class="bighatClassInnerWrapper">
                    <button class="bighatButton">
                        BIG HAT
                    </button>
                </div>
            </div>

            <div class="divineClassWrapper">
                <div class="divinClassInnerWrapper">
                    <button class="divineClassButton">
                        DIVINE
                    </button>
                </div>
            </div>

            <div class="mercenaryClassWrapper">
                <div class="mercenaryClassInnerWrapper">
                    <button class="mercenaryClassButton">
                        MERCENARY
                    </button>
                </div>
            </div>
        </div>`
    )

    let scrapeCharName = function () {
        return $('.characterNameInputText').val();
    }

    $('.clansmenButton').click( function () {
        let charName = scrapeCharName();
        $gameNetwork.CaptureCoreGameMetaData();
        $gameNetwork.CreateNewSaveFile($gameNetwork.userEmail, 'Clansmen')
    });

    $('.bighatButton').click( function () {
        let charName = scrapeCharName();
        $gameNetwork.CaptureCoreGameMetaData();
        $gameNetwork.CreateNewSaveFile($gameNetwork.userEmail, 'Big Hat')
    });

    $('.divineClassButton').click( function () {
        let charName = scrapeCharName();
        $gameNetwork.CaptureCoreGameMetaData();
        $gameNetwork.CreateNewSaveFile($gameNetwork.userEmail, 'Divine') 
    });

    $('.mercenaryClassButton').click( function () {
        let charName = scrapeCharName();
        $gameNetwork.CaptureCoreGameMetaData();
        $gameNetwork.CreateNewSaveFile($gameNetwork.userEmail, 'Mercenary')
    });
};

QuestDeluxePortal.prototype.createBackground = function() {
    this._backSprite1 = new Sprite(ImageManager.loadTitle1($dataSystem.title1Name));
    this._backSprite2 = new Sprite(ImageManager.loadTitle2($dataSystem.title2Name));
    this.addChild(this._backSprite1);
    this.addChild(this._backSprite2);
        this.centerSprite(this._backSprite1);
    this.centerSprite(this._backSprite2);
        this.createForeground();
};

QuestDeluxePortal.prototype.createForeground = function() {
    this._gameTitleSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
    this.addChild(this._gameTitleSprite);
    if ($dataSystem.optDrawTitle) {
        this.drawGameTitle();
    }
};

QuestDeluxePortal.prototype.drawGameTitle = function() {
    var x = 20;
    var y = Graphics.height / 4;
    var maxWidth = Graphics.width - x * 2;
    var text = $dataSystem.gameTitle;
    this._gameTitleSprite.bitmap.outlineColor = 'black';
    this._gameTitleSprite.bitmap.outlineWidth = 8;
    this._gameTitleSprite.bitmap.fontSize = 72;
    this._gameTitleSprite.bitmap.drawText(text, x, y, maxWidth, 48, 'center');
};

QuestDeluxePortal.prototype.centerSprite = function(sprite) {
    sprite.x = Graphics.width / 2;
    sprite.y = Graphics.height / 2;
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
};

QuestDeluxePortal.prototype.playTitleMusic = function() {
    AudioManager.playBgm($dataSystem.titleBgm);
    AudioManager.stopBgs();
    AudioManager.stopMe();
};




// ? ~ Maybe make Online portal optional by incorporating the orignal function in an if else ~ ?
// let Mage_SceneBootStart = Scene_Boot.prototype.start;

	Scene_Boot.prototype.start = function() {
	    Scene_Base.prototype.start.call(this);
	    SoundManager.preloadImportantSounds();
	    if (DataManager.isBattleTest()) {
	        DataManager.setupBattleTest();
	        SceneManager.goto(Scene_Battle);
	    } else if (DataManager.isEventTest()) {
	        DataManager.setupEventTest();
	        SceneManager.goto(Scene_Map);
	    } else {
	        this.checkPlayerLocation();
	        DataManager.setupNewGame();
	        SceneManager.goto(QuestDeluxePortal);
	    }
	    this.updateDocumentTitle();
	};
})();