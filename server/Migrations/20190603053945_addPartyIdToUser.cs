using Microsoft.EntityFrameworkCore.Migrations;

namespace server.Migrations
{
    public partial class addPartyIdToUser : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "currentPartyId",
                table: "AspNetUsers",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "currentPartyId",
                table: "AspNetUsers");
        }
    }
}
