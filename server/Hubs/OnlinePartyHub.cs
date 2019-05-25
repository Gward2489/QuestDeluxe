using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.SignalR;

namespace server.Hubs
{
    [EnableCors("SiteCorsPolicy")]
    public class OnlinePartyHub: Hub
    {
        
        public async Task AddToParty(string partyName, string playerData)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, partyName);

            await Clients.OthersInGroup(partyName).SendAsync("NewPlayerInParty", playerData);
        }

        public async Task AddToPartyAsHost(string partyName, string playerData)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, partyName);

            await Clients.Caller.SendAsync("NewPartyWithHost", playerData);
        }

        public async Task RemoveFromParty(string partyName, string playerData)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, partyName);

            await Clients.OthersInGroup(partyName).SendAsync("RemovePlayerFromParty", playerData);
        }

    }
}