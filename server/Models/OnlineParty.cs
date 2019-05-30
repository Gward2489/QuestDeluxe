using System.ComponentModel.DataAnnotations;

namespace server.Models
{
    public class OnlineParty
    {
        [Key]
        public int Id { get; set; }
        public ApplicationUser Host { get; set; }
        public string PartyName { get; set; }
        public string SeatOne { get; set; }
        public string SeatTwo { get; set; }
        public string SeatThree { get; set; }
        public bool IsFull { get; set; }

        
    }
}