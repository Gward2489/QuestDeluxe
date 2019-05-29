using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.SignalR;
using server.CustomTypes;
using server.DBContext;

namespace server.Hubs
{
    [EnableCors("SiteCorsPolicy")]
    public class OnlinePartyHub: Hub
    {

        PartyHandler _partyHandler;

        OnlinePartyHub(DatabaseContext context)
        {
            _partyHandler = new PartyHandler(context);
        }
        
        public async Task AddToParty(string partyName, string playerData)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, partyName);

            if (!await _partyHandler.JoinPartyAsync(partyName.Split(':')[1], playerData))
            {
                throw new HubException("Failed to Join Party");
            };

            await Clients.OthersInGroup(partyName).SendAsync("NewPlayerInParty", playerData);
        }

        public async Task AddToPartyAsHost(string partyName, string playerData)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, partyName);

            if (!await _partyHandler.CreateNewPartyAsync(partyName.Split(':')[1]))
            {
                throw new HubException("Failed to Create New Party");
            };

            await Clients.Caller.SendAsync("NewPartyWithHost", playerData);
        }

        public async Task RemoveFromParty(string partyName, string playerData)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, partyName);

            if (!await _partyHandler.RemoveFromPartyAsync(partyName.Split(':')[1], playerData))
            {
                throw new HubException("Failed To Remove Member From Group");
            };

            await Clients.OthersInGroup(partyName).SendAsync("RemovePlayerFromParty", playerData);
        }

    }
}