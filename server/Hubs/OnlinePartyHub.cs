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

        public OnlinePartyHub(DatabaseContext context)
        {
            _partyHandler = new PartyHandler(context);
        }
        
        public async Task AddToParty(string playerData, string hostName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"party:{hostName}");

            string partyResults = await _partyHandler.JoinPartyAsync(playerData, hostName);

            if (partyResults == "false") {
                throw new HubException("Failed to Join Party");
            };

            await Clients.Group($"party:{hostName}").SendAsync("NewPlayerInParty", partyResults);
        }

        public async Task AddToPartyAsHost(string partyName, string playerData)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, partyName);

            string partyResults = await _partyHandler.CreateNewPartyAsync(partyName.Split(':')[1]);

            if (partyResults == "false") 
            {
                throw new HubException("Failed to Create New Party");
            }

            await Clients.Caller.SendAsync("NewPartyWithHost", partyResults);
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