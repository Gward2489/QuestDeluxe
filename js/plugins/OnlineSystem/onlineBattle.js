

// custom GW function to create a window that will be used to indicate to the player
// they are waiting for a network player to finish their selection
Scene_Battle.prototype.createNetworkPlayerCommandWindow = function () {



};

// This is the function that is used by MV to progress to the next Battler Selection
// Scene_Battle.prototype.changeInputWindow

Scene_Battle.prototype.changeInputWindow = function() {
    if (BattleManager.isInputting()) {
        if (BattleManager.actor()) {
            this.startActorCommandSelection();
        } else {
            this.startPartyCommandSelection();
        }
    } else {
        this.endCommandSelection();
    }
};



// need to grab the action produced by an actor selection and send it via web socket to the rest of the party.
// when we receive the action in the client we will grab it and re-assign the _subjectActorId field to match 
// the id assigned the battler(class: Game_Actor) upon being added to the battlers array on online battle start.


// Will need to add the game actions from the incoming online event to the actions array of the GameActor that is the current ._subject of the battle manager


// FOR THE PARTY HOST: get all actions from party players. 
// THEN, assign those actions to the GameActors in the battlers array,
// THEN, kick off the turn and let the engine cycle throught the actions like normal
// as the engine invoked the actions, the host will need to store the action, targets array, and invoke type (Magic Reflect, Normal, etc..) so
// the host can push the caluclated results of the battle back to the party members.
// THEN, when the party members receive the data for their actions (and the other oarty members actions) (all party members will receive actions etc. for all party members including host, from the host)
// The battle manager will inject the data sent by the host automically.


// this is the function at the end of the battle manager cycle for actions. Here we will send attack info out the array.
BattleManager.endAction = function() {
    this._logWindow.endAction(this._subject);
    this._phase = 'turn';
};


//Will probably need to overload these functions to skip member and wait for action selection from party member

Game_Actor.prototype.makeActions = function() {
    Game_Battler.prototype.makeActions.call(this);
    if (this.numActions() > 0) {
        this.setActionState('undecided');
    } else {
        this.setActionState('waiting');
    }
    if (this.isAutoBattle()) {
        this.makeAutoBattleActions();
    } else if (this.isConfused()) {
        this.makeConfusionActions();
    }
};



BattleManager.selectNextCommand = function() {
    do {
        if (!this.actor() || !this.actor().selectNextCommand()) {
            this.changeActor(this._actorIndex + 1, 'waiting');
            if (this._actorIndex >= $gameParty.size()) {
                this.startTurn();
                break;
            }
        }
    } while (!this.actor().canInput());
};

BattleManager.selectPreviousCommand = function() {
    do {
        if (!this.actor() || !this.actor().selectPreviousCommand()) {
            this.changeActor(this._actorIndex - 1, 'undecided');
            if (this._actorIndex < 0) {
                return;
            }
        }
    } while (!this.actor().canInput());
};

// IMPORTANT ::: MakeActionOrders function combines game_actors from gameTroop(enemies) and gameParty(player and party members) and All Game_actor objects are looped over during all phases of turn
// Battle Manager gradually uses .shift() to delete actors from the _actionBattlers array as actions are created.


// Battle Manager function getNextSubject used during command selection skips gameTroop members via .isBattleMemberFunction().


// HOST will need to track and send actions/targets/etc. for gameTroop members and gameParty members



//may need to overload this function to move responsibility of generating random critical hitsevade / miss to host only.
// will need to also grab invoke counter attack / invoke magic reflections etc. from host level and push out.
Game_Action.prototype.apply = function(target) {
    var result = target.result();
    this.subject().clearResult();
    result.clear();
    result.used = this.testApply(target);
    result.missed = (result.used && Math.random() >= this.itemHit(target));
    result.evaded = (!result.missed && Math.random() < this.itemEva(target));
    result.physical = this.isPhysical();
    result.drain = this.isDrain();
    if (result.isHit()) {
        if (this.item().damage.type > 0) {
            result.critical = (Math.random() < this.itemCri(target));
            var value = this.makeDamageValue(target, result.critical);
            this.executeDamage(target, value);
        }
        this.item().effects.forEach(function(effect) {
            this.applyItemEffect(target, effect);
        }, this);
        this.applyItemUserEffect(target);
    }
};

BattleManager.invokeAction = function(subject, target) {
    this._logWindow.push('pushBaseLine');
    if (Math.random() < this._action.itemCnt(target)) {
        this.invokeCounterAttack(subject, target);
    } else if (Math.random() < this._action.itemMrf(target)) {
        this.invokeMagicReflection(subject, target);
    } else {
        this.invokeNormalAction(subject, target);
    }
    subject.setLastTarget(target);
    this._logWindow.push('popBaseLine');
    this.refreshStatus();
};

// Ultimately, party members battle logic will be over-ridden to yield and insert data from host, and host will do the oppisite.