using Microsoft.AspNetCore.Identity;

namespace server.Models
{
    public class ApplicationUser: IdentityUser
    {
        public string AccountName { get; set; }

        public int? currentPartyId { get; set; }

    }
}