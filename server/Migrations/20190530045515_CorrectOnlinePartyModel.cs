using Microsoft.EntityFrameworkCore.Migrations;

namespace server.Migrations
{
    public partial class CorrectOnlinePartyModel : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "partyName",
                table: "OnlineParty",
                newName: "PartyName");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PartyName",
                table: "OnlineParty",
                newName: "partyName");
        }
    }
}
