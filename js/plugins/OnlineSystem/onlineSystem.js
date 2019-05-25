import {Game_Network} from "./onlineCore";
import {Online_Party} from "./onlineParty";
import * as Broadcaster from "./onlineMapBroadcaster";
import * as LoginPortal from "./loginPortal";
export {$gameNetwork, $onlineParty};

var $gameNetwork = null;
var $onlineParty = null;

let MageCoreCreateGameObj = DataManager.createGameObjects;
DataManager.createGameObjects = function () {
    MageCoreCreateGameObj.call(this);
    $gameNetwork = $gameNetwork || new Game_Network();
    $onlineParty = $onlineParty || new Online_Party();
};