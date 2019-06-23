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

            List<DisconnectedPartyInfo> disconnectedPartiesInfo = new List<DisconnectedPartyInfo>();

            _dbcontext.OnlineParty.ToList().ForEach(thisParty => {

                Type type = thisParty.GetType();
                PropertyInfo[] propInfo =  type.GetProperties();
                 foreach (PropertyInfo info in propInfo)
                {
                    if (info.PropertyType == typeof(string))
                    {
                        if (info.GetValue(thisParty) != null)
                        {

                            string propValue = info.GetValue(thisParty).ToString();
                            if (propValue.StartsWith(disconnectedUser)) 
                            {
                                DisconnectedPartyInfo disconnectInfo = new DisconnectedPartyInfo();

                                if (info.Name == "PartyName") {

                                    disconnectInfo.ishost = true;
                                    disconnectInfo.party = thisParty;
                                    disconnectInfo.disconnectedUserProp = info;
                                    disconnectedPartiesInfo.Add(disconnectInfo);


                                } else {


                                    disconnectInfo.ishost = false;
                                    disconnectInfo.party = thisParty;
                                    disconnectInfo.disconnectedUserProp = info;
                                    disconnectedPartiesInfo.Add(disconnectInfo);

                                };


                            };



                        }


                    }
                };                

            });

            int infosCount = disconnectedPartiesInfo.Count;
            await ProcessPartyDisconnectAsync(disconnectedPartiesInfo, 0, infosCount, disconnectedUser);



            // // need to convert to recursive function
            // _dbcontext.OnlineParty.ToList().ForEach(async p => {

            //     Type type = p.GetType();
            //     PropertyInfo[] propInfo =  type.GetProperties();

            //     foreach (PropertyInfo info in propInfo)
            //     {
            //         string propValue = info.GetValue(p).ToString();
            //         if (propValue.StartsWith(disconnectedUser)) {
            //             parties.Add(p);

            //             info.SetValue(p, null);

            //             _dbcontext.OnlineParty.Update(p);
            //             await _dbcontext.SaveChangesAsync();

            //             if (info.Name == "PartyName") {

            //                 string partyName = "party:" + disconnectedUser;
            //                 await Clients.OthersInGroup(partyName).SendAsync("HostDropped", partyName);
            //                 _dbcontext.OnlineParty.Remove(p);
            //                 await _dbcontext.SaveChangesAsync();
            //             } else {

            //                 string partyName = "party:" + p.PartyName.Split("'")[0];
            //                 await Clients.OthersInGroup(partyName).SendAsync("PartyMemberDropped", disconnectedUser); 

            //             };
            //         };
            //     };

            // });

            //get application user by matching disconnected user with ApplicationUser.accountName ...
            // get party name by splitting partyName at "'" and then prefixing it with party:
            // then call this with party name await Groups.RemoveFromGroupAsync(Context.ConnectionId, partyName) to remove from hub group

            // grab party from db using currentPartyId on applicationUser.
            // if disconnected is user is host destroy whole party and evoke method to send logic to members
            // if disconnected user is not host, remove the user from their seat in the partObject


            await base.OnDisconnectedAsync(ex);

        }

        public async Task ProcessPartyDisconnectAsync(List<DisconnectedPartyInfo> partiesInfos, int index, int count, string disconnectedUser)
        {

            if (index < count)
            {
                DisconnectedPartyInfo party = partiesInfos[index];
                if (party.ishost)
                {

                    _dbcontext.OnlineParty.Remove(party.party);
                    await _dbcontext.SaveChangesAsync();
                    string partyName = "party:" + disconnectedUser;
                    await Clients.OthersInGroup(partyName).SendAsync("HostDropped", partyName);
                    int newIndex = index + 1;
                    await ProcessPartyDisconnectAsync(partiesInfos, newIndex, count, disconnectedUser);

                }
                else
                {
                    party.disconnectedUserProp.SetValue(party.party, null);
                    _dbcontext.OnlineParty.Update(party.party);
                    await _dbcontext.SaveChangesAsync();
                    string partyName = "party:" + party.party.PartyName.Split("'")[0];
                    await Clients.OthersInGroup(partyName).SendAsync("PartyMemberDropped", disconnectedUser); 
                    int newIndex = index + 1;
                    await ProcessPartyDisconnectAsync(partiesInfos, newIndex, count, disconnectedUser);
                }
            };

        }
    }

    public class DisconnectedPartyInfo
    {
        public bool ishost { get; set; }

        public PropertyInfo disconnectedUserProp { get; set; }

        public OnlineParty party { get; set; }

        DisconnectedPartyInfo(bool ishost, PropertyInfo disconnectedUserProp, OnlineParty party)
        {
            this.ishost = ishost;
            this.disconnectedUserProp = disconnectedUserProp;
            this.party = party;
        }

        public DisconnectedPartyInfo(){}
    }
}