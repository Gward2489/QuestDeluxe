using Microsoft.AspNetCore.Identity;

namespace server.Models
{
    public class ApplicationUser: IdentityUser
    {
        public string AccountName { get; set; }

    }
}