using InventoryAPI.Data;
using InventoryAPI.DTOs;

namespace InventoryAPI.Services
{
    public interface IUserService
    {
        UserProfileDto? GetProfile(int userId);
        (bool Success, string Message, UserProfileDto? Data) UpdateProfile(int userId, UpdateProfileDto dto);
        (bool Success, string Message) ChangePassword(int userId, ChangePasswordDto dto);
    }

    public class UserService : IUserService
    {
        private readonly InMemoryDatabase _db;

        public UserService(InMemoryDatabase db)
        {
            _db = db;
        }

        public UserProfileDto? GetProfile(int userId)
        {
            var user = _db.Users.FirstOrDefault(u => u.UserId == userId);
            if (user == null) return null;

            return new UserProfileDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                ProfileImage = user.ProfileImage,
                CreatedDate = user.CreatedDate
            };
        }

        public (bool Success, string Message, UserProfileDto? Data) UpdateProfile(int userId, UpdateProfileDto dto)
        {
            var user = _db.Users.FirstOrDefault(u => u.UserId == userId);
            if (user == null) return (false, "User not found", null);

            // Check username uniqueness
            if (_db.Users.Any(u => u.UserId != userId && u.Username.ToLower() == dto.Username.ToLower()))
                return (false, "Username already taken", null);

            if (_db.Users.Any(u => u.UserId != userId && u.Email.ToLower() == dto.Email.ToLower()))
                return (false, "Email already in use", null);

            user.Username = dto.Username;
            user.Email = dto.Email;
            if (!string.IsNullOrEmpty(dto.ProfileImage))
                user.ProfileImage = dto.ProfileImage;

            return (true, "Profile updated", GetProfile(userId));
        }

        public (bool Success, string Message) ChangePassword(int userId, ChangePasswordDto dto)
        {
            var user = _db.Users.FirstOrDefault(u => u.UserId == userId);
            if (user == null) return (false, "User not found");

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.Password))
                return (false, "Current password is incorrect");

            if (dto.NewPassword.Length < 6)
                return (false, "New password must be at least 6 characters");

            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            return (true, "Password changed successfully");
        }
    }
}
