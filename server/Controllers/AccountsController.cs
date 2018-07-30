using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using server.CustomTypes;
using server.DBContext;
using server.Models;

namespace server.Controllers
{
    [Route("api/Accounts")]
    [EnableCors("SiteCorsPolicy")]
    public class AccountsController: Controller
    {
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly DatabaseContext _context;
        
        public AccountsController(
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

    //  TODO: Endpoints for Account creation, login in, etc...

        [HttpPost("register")]
        public async Task<object> Register([FromBody] RegistrationData model)
        {
            var user = new ApplicationUser
            {
                UserName = model.email,
                Email = model.email,
                AccountName = model.accountName
            };

            IdentityResult result = await _userManager.CreateAsync(user, model.password);
            
            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, "User");
                await _signInManager.SignInAsync(user, false);
                return Ok(user);
            }

            return BadRequest(result.Errors);
        }

        [HttpPost("login")]
        public async Task<object> Login([FromBody] LoginData model)
        {

            var result = await _signInManager.PasswordSignInAsync(model.email, model.password, false, false);

            if (result.Succeeded)
            {
                var appUser = _context.ApplicationUser.SingleOrDefault(u => u.Email == model.email);
                LoginSuccess loginSuccess = new LoginSuccess() {
                    user = appUser.AccountName,
                    email = appUser.Email,
                    token = Convert.ToString(await GenerateJwtTokenAsync(appUser.Email, appUser))
                };
            
                return Ok(loginSuccess);
            }

            return BadRequest(result);
        }

        private async Task<object> GenerateJwtTokenAsync(string email, IdentityUser user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email)
            };

            var roles = await _userManager.GetRolesAsync(user);

            foreach (var role in roles)
            {
                if (role == "Admin")
                {
                    claims.Add(new Claim(ClaimTypes.NameIdentifier, user.Id));
                    claims.Add(new Claim(ClaimTypes.Role, "Admin"));
                }
                if (role == "User")
                {
                    claims.Add(new Claim(ClaimTypes.NameIdentifier, user.Id));
                    claims.Add(new Claim(ClaimTypes.Role, "User"));
                }
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.Now.AddDays(Convert.ToDouble(_configuration["JwtExpireDays"]));

            var token = new JwtSecurityToken(
                _configuration["JwtIssuer"],
                _configuration["JwtIssuer"],
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }



    }
}