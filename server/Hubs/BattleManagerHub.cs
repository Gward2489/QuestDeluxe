using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.SignalR;

namespace server.Hubs
{
    [EnableCors("SiteCorsPolicy")]
    public class BattleManagerHub: Hub
    {
        public async Task AddHostToBattleGroup(string battleGroupName, string playerData)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, battleGroupName);

            await Clients.OthersInGroup(battleGroupName).SendAsync("NewBattleHost", playerData);
        }
        public async Task RemoveHostFromBattleGroup(string battleGroupName, string playerData)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, battleGroupName);

            await Clients.OthersInGroup(battleGroupName).SendAsync("RemoveBattleHost", playerData);
        }
        public async Task AddNewBattleMember(string battleGroupName, string playerData)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, battleGroupName);

            await Clients.OthersInGroup(battleGroupName).SendAsync("NewBattleMember", playerData);
        }
        public async Task RemoveBattleMember(string battleGroupName, string playerData)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, battleGroupName);

            await Clients.OthersInGroup(battleGroupName).SendAsync("RemoveBattleHost", playerData);
        }

    }
}