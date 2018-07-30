using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.SignalR;

namespace server.Hubs
{
    [EnableCors("SiteCorsPolicy")]
    public class GameMapHub: Hub
    {

        public async Task BroadcastToMapGroup(string mapGroupName, string playerData)
        {
            await Clients.OthersInGroup(mapGroupName).SendAsync("PlayerMapUpdate", playerData);
        }

        public async Task AddToMapGroup(string mapGroupName, string playerData)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, mapGroupName);

            await Clients.OthersInGroup(mapGroupName).SendAsync("NewPlayerOnMap", playerData);
        }

        public async Task RemoveFromMapGroup(string mapGroupName, string playerData)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, mapGroupName);

            await Clients.OthersInGroup(mapGroupName).SendAsync("RemovePlayerFromMap", playerData);
        }
    }
}