using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.DBContext
{
    public class DatabaseContext : IdentityDbContext
    {
        public virtual DbSet<GameFile> GameFile { get; set; }
        public virtual DbSet<ApplicationUser> ApplicationUser { get; set; }
        public virtual DbSet<OnlineParty> OnlineParty { get; set; }


        public DatabaseContext(DbContextOptions<DatabaseContext> options)
           : base(options)
        {
        }
      
    }
}