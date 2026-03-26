using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using InventoryAPI.Data;
using InventoryAPI.DTOs;
using InventoryAPI.Models;
using Microsoft.IdentityModel.Tokens;

namespace InventoryAPI.Services
{
    public interface IAuthService
    {
        Task<(bool Success, string Message, AuthResponseDto? Data)> Register(RegisterDto dto);
        Task<(bool Success, string Message, AuthResponseDto? Data)> Login(LoginDto dto);
        string GenerateToken(User user);
    }

    public class AuthService : IAuthService
    {
        private readonly InMemoryDatabase _db;
        private readonly IConfiguration _config;

        public AuthService(InMemoryDatabase db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        public async Task<(bool Success, string Message, AuthResponseDto? Data)> Register(RegisterDto dto)
        {
            if (_db.Users.Any(u => u.Username.ToLower() == dto.Username.ToLower()))
                return (false, "Username already exists", null);

            if (_db.Users.Any(u => u.Email.ToLower() == dto.Email.ToLower()))
                return (false, "Email already registered", null);

            if (dto.Password.Length < 6)
                return (false, "Password must be at least 6 characters", null);

            var user = new User
            {
                UserId = _db.NextUserId(),
                Username = dto.Username,
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Email = dto.Email,
                Role = dto.Role ?? "User",
                ProfileImage = $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(dto.Username)}&background=6366f1&color=fff&size=128",
                CreatedDate = DateTime.UtcNow
            };

            _db.Users.Add(user);

            var token = GenerateToken(user);
            return (true, "Registration successful", new AuthResponseDto
            {
                Token = token,
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                ProfileImage = user.ProfileImage
            });
        }

        public async Task<(bool Success, string Message, AuthResponseDto? Data)> Login(LoginDto dto)
        {
            var user = _db.Users.FirstOrDefault(u => u.Username.ToLower() == dto.Username.ToLower());
            if (user == null)
                return (false, "Invalid username or password", null);

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
                return (false, "Invalid username or password", null);

            var token = GenerateToken(user);
            return (true, "Login successful", new AuthResponseDto
            {
                Token = token,
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                ProfileImage = user.ProfileImage
            });
        }

        public string GenerateToken(User user)
        {
            var jwtSettings = _config.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
