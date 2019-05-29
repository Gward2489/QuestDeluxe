using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using server.CustomTypes;
using server.DBContext;
using server.Models;

namespace server.Controllers
{
    [Route("api/parties")]
    [EnableCors("SiteCorsPolicy")]
    public class OnlinePartyController: Controller
    {
 
        PartyHandler _partyHandler;
        DatabaseContext _context;

        public OnlinePartyController(DatabaseContext context)
        {
            _partyHandler = new PartyHandler(context);
            _context = context;
        }


        [HttpGet]
        public async Task<IActionResult> GetAllPartiesAsync()
        {
            try
            {
                List<OnlineParty> parties = await _context.OnlineParty.ToListAsync();
                return Ok(parties);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{ownerId}")]
        public async Task<IActionResult> DeletePartyAsync(string ownerId)
        {
            try
            {
                ApplicationUser host = await _context.ApplicationUser.FirstOrDefaultAsync(u => u.Id == ownerId);

                if (host == null)
                {
                    return BadRequest("No Party Found With Given Host");
                }

                if (await _partyHandler.DeletePartyAsync(host.AccountName))
                {
                    return Ok("Party Deleted");
                }
                else
                {
                    return BadRequest("Failed to Delete Party");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }
}