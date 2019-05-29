using Microsoft.EntityFrameworkCore.Migrations;

namespace server.Migrations
{
    public partial class addingExtraProp : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "partyName",
                table: "OnlineParty",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "partyName",
                table: "OnlineParty");
        }
    }
}
