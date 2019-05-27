import {$gameNetwork} from "./onlineSystem"
export {QuestDeluxePortal, Input}

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

QuestDeluxePortal.prototype.reBindInput = function() {
    Input.initialize();
};

QuestDeluxePortal.prototype.start = function () {
    Scene_Base.prototype.start.call(this);
    SceneManager.clearStack();
    // this.playTitleMusic();
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

QuestDeluxePortal.prototype.RegistrationSuccess = function() {
    let context = this;
    let screenWidth = (Graphics.boxWidth - (Graphics.boxWidth / 3));
    $('#ErrorPrinter').html(
        `<div class="registrationSuccessWrapper" style="width:${screenWidth}px">
            <div class="registrationSuccessInnerWrapper">
                <div class="registrationSuccessTextWrapper">
                    <div class="registrationSuccessText">
                        Registration Succesful! 
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
        QuestDeluxePortal.prototype.LoginForm();
    })
}

QuestDeluxePortal.prototype.RegistrationForm = function() {
    let context = this;
    let screenWidth = (Graphics.boxWidth - (Graphics.boxWidth / 3));
    $("#ErrorPrinter").html(
        `<div id="RegisterForm" style="width:${screenWidth}px">
            <div class="registrationWrapper">
                <div>
                    <div class="register-text">
                        Provide your email address, a desired user name, and a password. 
                    </div>
                </div>

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
                <div class="passwordWrapper">
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
        QuestDeluxePortal.prototype.LoginForm();
    });
}

QuestDeluxePortal.prototype.LoginForm = function() {
    let context = this;
    let screenWidth = (Graphics.boxWidth - (Graphics.boxWidth / 3));
    $("#ErrorPrinter").html(
        `<div id="LoginForm" style="width:${screenWidth}px">
            <div class="LoginWrapper">
                <div>
                    <div class="welcome-text">
                        Welcome. Log In below, or click the Sign Up button to create a new account. 
                    </div>
                </div>
                <div class="loginEmailWrapper">
                    <div class="loginEmailInput">
                        <input class="loginEmailText" placeholder="email">
                    </div>
                </div>
                <div class="loginPasswordWrapper">
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
        QuestDeluxePortal.prototype.RegistrationForm();
    });
}

QuestDeluxePortal.prototype.CharacterSelect = function() {
    let context = this;
    let screenWidth = (Graphics.boxWidth - (Graphics.boxWidth / 3));
    $("#ErrorPrinter").html(
        `<div id="CharacterSelectScreen" style="width:${screenWidth}px">
            <div class="charSelectWrapper">
                <div class="welcome-text">
                    Select your character, or create a new one by clicking the new character button. 
                </div>
                <div class="charSelectButtonsWrapper">
                    <div class="charSelectButtons">
                        <button class="newCharacterButton">
                            NEW CHARACTER
                        </button>
                        <button class="logoutButton">
                            LOG OUT
                        </button>
                        <button class="accountOptionsButton">
                            OPTIONS
                        </button>
                    </div>
                </div>
                <div class="charactersTableWrapper">
                    <div class="charactersTableContainer">
                        <table style="width:100%" class="charactersTable">
                            <tr>
                                <th>Select</th>
                                <th>Level</th> 
                                <th>Class</th>
                                <th>Character Name</th>
                            </tr>
                        </table>
                        <div class="charactersLoading">
                            <div>
                                Loading your characters...
                            </div>
                            <div style="margin-top:12px;">
                                <img src="../extra_images/loading.gif" alt="loading-gif" height="50px" width="50px">
                            </div>
                        </div>
                    </div>
                    </div>
                </div> 
            </div>
        </div>`
    )

    $('.charactersTable').hide();

    let printGames = function (response) {
        $('.charactersLoading').hide();
        $('.charactersTable').show();
        $gameNetwork.loadedGames = [];
        let count = 1;
        $gameNetwork.loadedGames.push(null);
        response.forEach(d => {
            // let string = LZString.decompressFromBase64(d)
            let parsedData = JsonEx.parse(d);
            $gameNetwork.loadedGames.push(parsedData);
            let charData = parsedData.actors._data[1];
            $('.charactersTable').append(` 
            <tr>
                <td><button class="game${count}">CHOOSE</button></td>
                <td>${charData.initialLevel}</td> 
                <td>${charData.altClassName}</td>
                <td>${charData.name}</td>
            </tr>
            `);
            $(`.game${count}`).attr("gameIndex", `${count}`).click( function (evt) {

                $("#ErrorPrinter").html('')
                QuestDeluxePortal.prototype.reBindInput();
                
                let index = Number($(evt.currentTarget).attr("gameIndex"));
                let game = $gameNetwork.loadedGames[index];
                $gameNetwork.LoadSavedGame(game);
                // $gameNetwork.PopulateDatabase(d);
                // DataManager.createGameObjects();
                // $gameParty.setupStartingMembers();
                // $gameNetwork.currentMapId = d.$dataSystem.startMapId;
                // $gamePlayer.reserveTransfer($dataSystem.startMapId,
                //     $dataSystem.startX, $dataSystem.startY);
                // Graphics.frameCount = 0;
                // SceneManager.goto(Scene_Map);
                // $gameNetwork.connectMapSocketAfterLogin();



            });
            count ++;
        });
    }

    $gameNetwork.LoadGameFilesFromServer($gameNetwork.userEmail, printGames);

    $('.newCharacterButton').click( function () {
        QuestDeluxePortal.prototype.NewCharacter();
    });
}

QuestDeluxePortal.prototype.NewCharacter = function() {
    let context = this;
    let screenWidth = (Graphics.boxWidth - (Graphics.boxWidth / 3));
    $("#ErrorPrinter").html(
        `<div id="NewCharacterScreen" class="panel panel-primary" style="width:${screenWidth}px">
            <div class="newCharacterWrapper">
                <div class="nameWarning">
                    <div class="infoText">
                        You must enter a name for your character
                    </div>
                    <div>
                    <button class="confirmNameWarning">
                        OK
                    </button>
                    </div>   
                </div>
                <div class="charSelectMain">
                    <div class="infoTextWrapper">
                        <div class="infoTextInnerWrapper">
                            <div class="infoText">
                                Enter a character name and select your base class
                            </div>
                        </div>
                    </div>
                    <div class="characterNameWrapper">
                        <div class="characterNameInput">
                            <input class="characterNameInputText" type="text" placeholder="character name">
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
                </div>
            </div>
        </div>`
    )

    $('.nameWarning').hide();

    let scrapeCharName = function () {
        return $('.characterNameInputText').val();
    }

    $('.confirmNameWarning').click( function () {
        $('.nameWarning').hide(); 
        $('.charSelectMain').show();
    });


    $('.clansmenButton').click( function () {
        let charName = scrapeCharName();
        if (charName === "") {
            $('.charSelectMain').hide();
            $('.nameWarning').show();
            return
        }
        // $gameNetwork.CaptureCoreGameMetaData();
        $gameNetwork.CreateNewGame($gameNetwork.userEmail, 'Clansmen', QuestDeluxePortal.prototype.CharacterSelect, charName);
        //$gameNetwork.CreateNewSaveFile($gameNetwork.userEmail, 'Clansmen', QuestDeluxePortal.prototype.CharacterSelect, charName)
        QuestDeluxePortal.prototype.loadingScreen();
    });

    $('.bighatButton').click( function () {
        let charName = scrapeCharName();
        if (charName === "") {
            $('.charSelectMain').hide();
            $('.nameWarning').show();
            return
        }
        // $gameNetwork.CaptureCoreGameMetaData();
        $gameNetwork.CreateNewGame($gameNetwork.userEmail, 'Big Hat', QuestDeluxePortal.prototype.CharacterSelect, charName);
        //$gameNetwork.CreateNewSaveFile($gameNetwork.userEmail, 'Big Hat', QuestDeluxePortal.prototype.CharacterSelect, charName)
        QuestDeluxePortal.prototype.loadingScreen();

    });

    $('.divineClassButton').click( function () {
        let charName = scrapeCharName();
        if (charName === "") {
            $('.charSelectMain').hide();
            $('.nameWarning').show();
            return
        }
        // $gameNetwork.CaptureCoreGameMetaData();
        $gameNetwork.CreateNewGame($gameNetwork.userEmail, 'Divine', QuestDeluxePortal.prototype.CharacterSelect, charName);
        //$gameNetwork.CreateNewSaveFile($gameNetwork.userEmail, 'Divine', QuestDeluxePortal.prototype.CharacterSelect, charName) 
        QuestDeluxePortal.prototype.loadingScreen();

    });

    $('.mercenaryClassButton').click( function () {
        let charName = scrapeCharName();
        if (charName === "") {
            $('.charSelectMain').hide();
            $('.nameWarning').show();
            return
        }
        // $gameNetwork.CaptureCoreGameMetaData();
        $gameNetwork.CreateNewGame($gameNetwork.userEmail, 'Mercenary', QuestDeluxePortal.prototype.CharacterSelect, charName);
        //$gameNetwork.CreateNewSaveFile($gameNetwork.userEmail, 'Mercenary', QuestDeluxePortal.prototype.CharacterSelect, charName)
        QuestDeluxePortal.prototype.loadingScreen();
    });
};

QuestDeluxePortal.prototype.loadingScreen = function () {
    let context = this;
    let screenWidth = (Graphics.boxWidth - (Graphics.boxWidth / 3));
    $("#ErrorPrinter").html(
        `<div id="loadingScreen" style="width:${screenWidth}px">
            <div class="loadingScreenWrapper">
                <div>
                    Creating New Game...
                </div>
                <div style="margin-top:12px;">
                    <img src="../extra_images/loading.gif" alt="loading-gif" height="80px" width="80px">
                </div>
            </div>
        </div>`);   
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
    

    //-----------------------------------------------------------------------------
	//
	// Overriding 'Input._onKeyDown' to pass 'event' as parameter
	// to 'Input._shouldPreventDefault'
	//

	Input._onKeyDown = function(event) {
	    if (this._shouldPreventDefault(event)) {
	        event.preventDefault();
	    }
	    if (event.keyCode === 144) {    // Numlock
	        this.clear();
	    }
	    var buttonName = this.keyMapper[event.keyCode];
	    if (buttonName) {
	        this._currentState[buttonName] = true;
	    }
	};

    //-----------------------------------------------------------------------------
	//
	// Overriding Input._shouldPreventDefault to allow the use of the 'backspace key'
	// in input forms.
	//

	Input._shouldPreventDefault = function(e) {
	    switch (e.keyCode) {
		    case 8:     // backspace
		    	if ($(e.target).is("input, textarea"))
		    		break;
		    case 33:    // pageup
		    case 34:    // pagedown
		    case 37:    // left arrow
		    case 38:    // up arrow
		    case 39:    // right arrow
		    case 40:    // down arrow
		        return true;
	    }
	    return false;
	};
