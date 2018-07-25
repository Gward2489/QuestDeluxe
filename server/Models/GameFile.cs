using System.ComponentModel.DataAnnotations;

namespace server.Models
{
    public class GameFile
    {

        [Key]
        public int Id { get; set; }
        public string GameData { get; set; }
        public ApplicationUser Owner { get; set; }

    }
}