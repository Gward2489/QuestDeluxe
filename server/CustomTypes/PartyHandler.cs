using Microsoft.EntityFrameworkCore;
using server.DBContext;
using server.Models;
using System;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace server.CustomTypes 
{
    public class PartyHandler 
    {
        DatabaseContext _context;
        public PartyHandler(DatabaseContext context)
        {
            _context = context;
        }


        public async Task<bool> CreateNewPartyAsync(string accountName)
        {
            try 
            {
                ApplicationUser host = await _context.ApplicationUser.FirstOrDefaultAsync(user => user.AccountName == accountName);
                OnlineParty newParty = new OnlineParty();
                newParty.PartyName = host.AccountName + "'s Party";
                newParty.Host = host;
                newParty.IsFull = false;

                await _context.OnlineParty.AddAsync(newParty);
                await _context.SaveChangesAsync();
                return true;

            } 
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            };
        }

        public async Task<bool> JoinPartyAsync(string accountName, string partyHostName)
        {
            try
            {
                ApplicationUser host = await _context.ApplicationUser.FirstOrDefaultAsync(user => user.AccountName == accountName);
                OnlineParty party = await _context.OnlineParty.FirstOrDefaultAsync(onlineParty => onlineParty.Host.AccountName == host.AccountName);

                if (party == null)
                {
                    return false;
                }

                bool foundSlot = false;
                foreach (PropertyInfo propInfo in party.GetType().GetProperties())
                {
                    if (propInfo.Name.StartsWith("Seat"))
                    {
                        if (propInfo.GetValue(party) == null)
                        {
                            if (!foundSlot) {
                                propInfo.SetValue(party, accountName);
                                foundSlot = true;                        
                            };
                        };
                    };
                };

                return foundSlot ? true : false;

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            }
        }

        public async Task<bool> DeletePartyAsync(string partyHostName)
        {
            try
            {
                OnlineParty onlineParty = await _context.OnlineParty.FirstOrDefaultAsync(party => party.Host.AccountName == partyHostName);

                if (onlineParty == null)
                {
                    return false;
                };

                _context.OnlineParty.Remove(onlineParty);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            };
        }

        public async Task<bool> RemoveFromPartyAsync(string partyHostName, string memberToRemove)
        {
            try
            {

                OnlineParty onlineParty = await _context.OnlineParty.FirstOrDefaultAsync(party => party.Host.AccountName == partyHostName);

                if (onlineParty == null)
                {
                    return false;
                };

                bool foundMember = false;
                foreach (PropertyInfo propInfo in onlineParty.GetType().GetProperties())
                {
                    if (propInfo.Name.StartsWith("Seat"))
                    {
                        if (!foundMember) {
                            if (propInfo.GetValue(onlineParty).ToString() == memberToRemove)
                            {
                                foundMember = true;
                                propInfo.SetValue(onlineParty, null);
                            };
                        };
                    };
                };

                return foundMember ? true : false;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            }
        }

    }
}