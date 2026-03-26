using InventoryAPI.Models;
using BCrypt.Net;

namespace InventoryAPI.Data
{
    public class InMemoryDatabase
    {
        public List<User> Users { get; set; } = new();
        public List<Category> Categories { get; set; } = new();
        public List<Product> Products { get; set; } = new();

        private int _userIdCounter = 1;
        private int _categoryIdCounter = 1;
        private int _productIdCounter = 1;

        public int NextUserId() => _userIdCounter++;
        public int NextCategoryId() => _categoryIdCounter++;
        public int NextProductId() => _productIdCounter++;

        public InMemoryDatabase()
        {
            SeedData();
        }

        private void SeedData()
        {
            // Seed Users
            Users.Add(new User
            {
                UserId = NextUserId(),
                Username = "admin",
                Password = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Email = "admin@inventory.com",
                Role = "Admin",
                ProfileImage = "https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff&size=128",
                CreatedDate = DateTime.UtcNow.AddDays(-30)
            });

            Users.Add(new User
            {
                UserId = NextUserId(),
                Username = "john_doe",
                Password = BCrypt.Net.BCrypt.HashPassword("John@123"),
                Email = "john@inventory.com",
                Role = "User",
                ProfileImage = "https://ui-avatars.com/api/?name=John+Doe&background=10b981&color=fff&size=128",
                CreatedDate = DateTime.UtcNow.AddDays(-20)
            });

            // Seed Categories
            var electronics = new Category { CategoryId = NextCategoryId(), CategoryName = "Electronics", CreatedDate = DateTime.UtcNow.AddDays(-25) };
            var clothing = new Category { CategoryId = NextCategoryId(), CategoryName = "Clothing", CreatedDate = DateTime.UtcNow.AddDays(-25) };
            var food = new Category { CategoryId = NextCategoryId(), CategoryName = "Food & Beverages", CreatedDate = DateTime.UtcNow.AddDays(-24) };
            var furniture = new Category { CategoryId = NextCategoryId(), CategoryName = "Furniture", CreatedDate = DateTime.UtcNow.AddDays(-23) };
            var sports = new Category { CategoryId = NextCategoryId(), CategoryName = "Sports", CreatedDate = DateTime.UtcNow.AddDays(-22) };
            var books = new Category { CategoryId = NextCategoryId(), CategoryName = "Books", CreatedDate = DateTime.UtcNow.AddDays(-21) };

            Categories.AddRange(new[] { electronics, clothing, food, furniture, sports, books });

            // Seed Products
            var productImages = new[]
            {
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
                "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=300&fit=crop",
                "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=300&h=300&fit=crop",
                "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=300&h=300&fit=crop",
                "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&h=300&fit=crop",
                "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=300&h=300&fit=crop",
                "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=300&h=300&fit=crop",
                "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=300&h=300&fit=crop",
                "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=300&fit=crop",
                "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop"
            };

            var products = new List<(string name, int catId, string catName, int qty, decimal price, string desc)>
            {
                ("iPhone 15 Pro", electronics.CategoryId, electronics.CategoryName, 45, 999.99m, "Latest Apple flagship smartphone with titanium design"),
                ("Samsung 4K TV 55\"", electronics.CategoryId, electronics.CategoryName, 12, 799.99m, "Crystal clear 4K QLED Smart TV with HDR"),
                ("Sony WH-1000XM5 Headphones", electronics.CategoryId, electronics.CategoryName, 3, 349.99m, "Industry-leading noise canceling wireless headphones"),
                ("MacBook Pro 14\"", electronics.CategoryId, electronics.CategoryName, 8, 1999.99m, "Apple M3 Pro chip, 18GB RAM, 512GB SSD"),
                ("Men's Running Shoes", clothing.CategoryId, clothing.CategoryName, 120, 89.99m, "Lightweight breathable running shoes for all terrain"),
                ("Women's Yoga Pants", clothing.CategoryId, clothing.CategoryName, 85, 49.99m, "High-waist moisture-wicking yoga pants"),
                ("Organic Coffee Beans 1kg", food.CategoryId, food.CategoryName, 200, 24.99m, "Premium single-origin Arabica coffee beans"),
                ("Premium Green Tea", food.CategoryId, food.CategoryName, 150, 14.99m, "Japanese matcha grade ceremonial green tea"),
                ("Office Ergonomic Chair", furniture.CategoryId, furniture.CategoryName, 4, 449.99m, "Adjustable lumbar support mesh office chair"),
                ("Standing Desk 160cm", furniture.CategoryId, furniture.CategoryName, 6, 599.99m, "Electric height-adjustable sit-stand desk"),
                ("Professional Tennis Racket", sports.CategoryId, sports.CategoryName, 30, 129.99m, "Carbon fiber frame tournament-grade tennis racket"),
                ("Yoga Mat Premium", sports.CategoryId, sports.CategoryName, 75, 39.99m, "Non-slip extra thick 6mm eco-friendly yoga mat"),
                ("Clean Code Book", books.CategoryId, books.CategoryName, 50, 34.99m, "A Handbook of Agile Software Craftsmanship by Robert C. Martin"),
                ("JavaScript: The Good Parts", books.CategoryId, books.CategoryName, 40, 29.99m, "Unearthing the Excellence in JavaScript by Douglas Crockford"),
                ("Wireless Charging Pad", electronics.CategoryId, electronics.CategoryName, 2, 49.99m, "15W fast wireless charging pad compatible with all Qi devices"),
            };

            for (int i = 0; i < products.Count; i++)
            {
                var p = products[i];
                Products.Add(new Product
                {
                    Id = NextProductId(),
                    ProductName = p.name,
                    CategoryId = p.catId,
                    CategoryName = p.catName,
                    Quantity = p.qty,
                    Price = p.price,
                    Description = p.desc,
                    ProductImage = productImages[i % productImages.Length],
                    CreatedDate = DateTime.UtcNow.AddDays(-(15 - i)),
                    UpdatedDate = DateTime.UtcNow.AddDays(-(15 - i))
                });
            }
        }
    }
}
