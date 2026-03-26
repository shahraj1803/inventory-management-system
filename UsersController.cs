using System.Security.Claims;
using InventoryAPI.DTOs;
using InventoryAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService) => _userService = userService;

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet("profile")]
        public IActionResult GetProfile()
        {
            var profile = _userService.GetProfile(GetUserId());
            if (profile == null) return NotFound(new { message = "User not found" });
            return Ok(profile);
        }

        [HttpPut("profile")]
        public IActionResult UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var (success, message, data) = _userService.UpdateProfile(GetUserId(), dto);
            if (!success) return BadRequest(new { message });
            return Ok(new { message, data });
        }

        [HttpPost("change-password")]
        public IActionResult ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var (success, message) = _userService.ChangePassword(GetUserId(), dto);
            if (!success) return BadRequest(new { message });
            return Ok(new { message });
        }
    }
}
