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
using server.DBContext;
using server.Models;

namespace server.Controllers
{
    [Route("api/GameData")]
    [EnableCors("SiteCorsPolicy")]
    public class GameDataController: Controller
    {
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly DatabaseContext _context;
        
        public GameDataController(
            UserManager<IdentityUser> userManager,
            SignInManager<IdentityUser> signInManager,
            IConfiguration configuration,
            DatabaseContext context
            )
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _context = context;
            
        }

        [HttpPost("SaveNewGame/{ownerEmail}")]
        public async Task<IActionResult> NewGameAsync([FromBody]dynamic content, string ownerEmail)
        {
            try 
            {
                GameFile gamefile = new GameFile();

                gamefile.GameData = JsonConvert.SerializeObject(content);
                ApplicationUser fileOwner = await _context.ApplicationUser.FirstOrDefaultAsync(
                    u => u.Email == ownerEmail
                );

                gamefile.Owner = fileOwner;    
                await _context.GameFile.AddAsync(gamefile);
                await _context.SaveChangesAsync();
                return Ok(gamefile);
            }
            catch (Exception ex) 
            {
                Console.WriteLine(ex);
                return BadRequest("There was an error retreiving the db");
            }
        }

        [HttpGet("{ownerEmail}")]
        public async Task<IActionResult> LoadGameFilesAsync(string ownerEmail)
        {
            try 
            {
                ApplicationUser owner = await _context.ApplicationUser.FirstOrDefaultAsync(
                        u => u.Email == ownerEmail
                );

                List<GameFile> userData = new List<GameFile>();
                await _context.GameFile.ForEachAsync( f => {
                    if (f.Owner == owner) {
                        userData.Add(f);
                    }
                });

                List<dynamic> parsedFiles = new List<dynamic>();
                userData.ForEach(u => {
                    var file = JsonConvert.DeserializeObject(u.GameData);
                    parsedFiles.Add(file);
                });

                return Ok(parsedFiles);
            }

            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return BadRequest("There was an error retreiving the db");
            }

        }

        [HttpPut("SaveGame")]
        public async Task<IActionResult> SaveGameFileAsync([FromBody]GameFile gameFile)
        {
            try
            {
                GameFile fileToUpdate = await _context.GameFile.FirstOrDefaultAsync(
                    g => g.Id == gameFile.Id
                );

                fileToUpdate.GameData = gameFile.GameData;

                _context.GameFile.Update(fileToUpdate);
                await _context.SaveChangesAsync();
                return Ok(fileToUpdate);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return BadRequest("There was an error saving to the db");
            }
        }
    }
}