using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.SignalR;
using server.CustomTypes;
using server.DBContext;
using server.Models;

namespace server.Hubs
{
    [EnableCors("SiteCorsPolicy")]
    public class OnlinePartyHub: Hub
    {

        PartyHandler _partyHandler;
        DatabaseContext _dbcontext;

        public OnlinePartyHub(DatabaseContext context)
        {
            _partyHandler = new PartyHandler(context);
            _dbcontext = context;
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

        public override async Task OnDisconnectedAsync(Exception ex)
        {

            string disconnectedUser = "";
            foreach (var item in Context.User.Claims)
            {
                if (item.Type == "Name")
                {
                    disconnectedUser = item.Value;
                };
            };


            List<OnlineParty> parties = new List<OnlineParty>();


            // loop through all parties and find parties that the disconnected user belongs to.
            // remove the user from the parties.
            // send message to other party members user has dropped so logic to adjust party accordingly can fire.
            // if host destroy party



            // need to convert to recursive function
            _dbcontext.OnlineParty.ToList().ForEach(async p => {

                Type type = p.GetType();
                PropertyInfo[] propInfo =  type.GetProperties();

                foreach (PropertyInfo info in propInfo)
                {
                    string propValue = info.GetValue(p).ToString();
                    if (propValue.StartsWith(disconnectedUser)) {
                        parties.Add(p);

                        info.SetValue(p, null);

                        _dbcontext.OnlineParty.Update(p);
                        await _dbcontext.SaveChangesAsync();

                        if (info.Name == "PartyName") {

                            string partyName = "party:" + disconnectedUser;
                            await Clients.OthersInGroup(partyName).SendAsync("HostDropped", partyName);
                            _dbcontext.OnlineParty.Remove(p);
                            await _dbcontext.SaveChangesAsync();
                        } else {

                            string partyName = "party:" + p.PartyName.Split("'")[0];
                            await Clients.OthersInGroup(partyName).SendAsync("PartyMemberDropped", disconnectedUser); 

                        };
                    };
                };

            });

            //get application user by matching disconnected user with ApplicationUser.accountName ...
            // get party name by splitting partyName at "'" and then prefixing it with party:
            // then call this with party name await Groups.RemoveFromGroupAsync(Context.ConnectionId, partyName) to remove from hub group

            // grab party from db using currentPartyId on applicationUser.
            // if disconnected is user is host destroy whole party and evoke method to send logic to members
            // if disconnected user is not host, remove the user from their seat in the partObject


            await base.OnDisconnectedAsync(ex);

        }

    }
}