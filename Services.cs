using InventoryAPI.Data;
using InventoryAPI.DTOs;
using InventoryAPI.Models;

namespace InventoryAPI.Services
{
    public interface IProductService
    {
        PagedResult<ProductDto> GetProducts(ProductQueryParams query);
        ProductDto? GetById(int id);
        (bool Success, string Message, ProductDto? Data) Create(CreateProductDto dto);
        (bool Success, string Message, ProductDto? Data) Update(int id, CreateProductDto dto);
        (bool Success, string Message) Delete(int id);
    }

    public class ProductService : IProductService
    {
        private readonly InMemoryDatabase _db;

        public ProductService(InMemoryDatabase db) => _db = db;

        public PagedResult<ProductDto> GetProducts(ProductQueryParams q)
        {
            var query = _db.Products.AsQueryable();

            if (!string.IsNullOrEmpty(q.Search))
                query = query.Where(p => p.ProductName.ToLower().Contains(q.Search.ToLower()) ||
                                        (p.Description ?? "").ToLower().Contains(q.Search.ToLower()));

            if (q.CategoryId.HasValue)
                query = query.Where(p => p.CategoryId == q.CategoryId.Value);

            query = q.SortBy?.ToLower() switch
            {
                "price" => q.SortOrder == "desc" ? query.OrderByDescending(p => p.Price) : query.OrderBy(p => p.Price),
                "quantity" => q.SortOrder == "desc" ? query.OrderByDescending(p => p.Quantity) : query.OrderBy(p => p.Quantity),
                "name" => q.SortOrder == "desc" ? query.OrderByDescending(p => p.ProductName) : query.OrderBy(p => p.ProductName),
                _ => query.OrderByDescending(p => p.CreatedDate)
            };

            var total = query.Count();
            var items = query.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).Select(MapToDto).ToList();

            return new PagedResult<ProductDto>
            {
                Items = items,
                TotalCount = total,
                Page = q.Page,
                PageSize = q.PageSize,
                TotalPages = (int)Math.Ceiling(total / (double)q.PageSize)
            };
        }

        public ProductDto? GetById(int id)
        {
            var p = _db.Products.FirstOrDefault(x => x.Id == id);
            return p == null ? null : MapToDto(p);
        }

        public (bool Success, string Message, ProductDto? Data) Create(CreateProductDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.ProductName))
                return (false, "Product name is required", null);

            var category = _db.Categories.FirstOrDefault(c => c.CategoryId == dto.CategoryId);
            if (category == null) return (false, "Category not found", null);

            var product = new Product
            {
                Id = _db.NextProductId(),
                ProductName = dto.ProductName,
                CategoryId = dto.CategoryId,
                CategoryName = category.CategoryName,
                Quantity = dto.Quantity,
                Price = dto.Price,
                Description = dto.Description,
                ProductImage = dto.ProductImage ?? $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(dto.ProductName)}&background=6366f1&color=fff&size=300",
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow
            };

            _db.Products.Add(product);
            return (true, "Product created", MapToDto(product));
        }

        public (bool Success, string Message, ProductDto? Data) Update(int id, CreateProductDto dto)
        {
            var product = _db.Products.FirstOrDefault(p => p.Id == id);
            if (product == null) return (false, "Product not found", null);

            var category = _db.Categories.FirstOrDefault(c => c.CategoryId == dto.CategoryId);
            if (category == null) return (false, "Category not found", null);

            product.ProductName = dto.ProductName;
            product.CategoryId = dto.CategoryId;
            product.CategoryName = category.CategoryName;
            product.Quantity = dto.Quantity;
            product.Price = dto.Price;
            product.Description = dto.Description;
            if (!string.IsNullOrEmpty(dto.ProductImage))
                product.ProductImage = dto.ProductImage;
            product.UpdatedDate = DateTime.UtcNow;

            return (true, "Product updated", MapToDto(product));
        }

        public (bool Success, string Message) Delete(int id)
        {
            var product = _db.Products.FirstOrDefault(p => p.Id == id);
            if (product == null) return (false, "Product not found");
            _db.Products.Remove(product);
            return (true, "Product deleted");
        }

        private static ProductDto MapToDto(Product p) => new()
        {
            Id = p.Id,
            ProductName = p.ProductName,
            CategoryId = p.CategoryId,
            CategoryName = p.CategoryName,
            Quantity = p.Quantity,
            Price = p.Price,
            Description = p.Description,
            ProductImage = p.ProductImage,
            CreatedDate = p.CreatedDate,
            UpdatedDate = p.UpdatedDate
        };
    }

    public interface ICategoryService
    {
        List<CategoryDto> GetAll();
        CategoryDto? GetById(int id);
        (bool Success, string Message, CategoryDto? Data) Create(CreateCategoryDto dto);
        (bool Success, string Message, CategoryDto? Data) Update(int id, CreateCategoryDto dto);
        (bool Success, string Message) Delete(int id);
    }

    public class CategoryService : ICategoryService
    {
        private readonly InMemoryDatabase _db;

        public CategoryService(InMemoryDatabase db) => _db = db;

        public List<CategoryDto> GetAll() => _db.Categories.Select(MapToDto).ToList();

        public CategoryDto? GetById(int id)
        {
            var c = _db.Categories.FirstOrDefault(x => x.CategoryId == id);
            return c == null ? null : MapToDto(c);
        }

        public (bool Success, string Message, CategoryDto? Data) Create(CreateCategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CategoryName))
                return (false, "Category name is required", null);

            if (_db.Categories.Any(c => c.CategoryName.ToLower() == dto.CategoryName.ToLower()))
                return (false, "Category already exists", null);

            var cat = new Category
            {
                CategoryId = _db.NextCategoryId(),
                CategoryName = dto.CategoryName,
                CreatedDate = DateTime.UtcNow
            };

            _db.Categories.Add(cat);
            return (true, "Category created", MapToDto(cat));
        }

        public (bool Success, string Message, CategoryDto? Data) Update(int id, CreateCategoryDto dto)
        {
            var cat = _db.Categories.FirstOrDefault(c => c.CategoryId == id);
            if (cat == null) return (false, "Category not found", null);

            if (_db.Categories.Any(c => c.CategoryId != id && c.CategoryName.ToLower() == dto.CategoryName.ToLower()))
                return (false, "Category name already exists", null);

            cat.CategoryName = dto.CategoryName;

            // Update product category names
            foreach (var p in _db.Products.Where(p => p.CategoryId == id))
                p.CategoryName = dto.CategoryName;

            return (true, "Category updated", MapToDto(cat));
        }

        public (bool Success, string Message) Delete(int id)
        {
            var cat = _db.Categories.FirstOrDefault(c => c.CategoryId == id);
            if (cat == null) return (false, "Category not found");

            if (_db.Products.Any(p => p.CategoryId == id))
                return (false, "Cannot delete category with existing products");

            _db.Categories.Remove(cat);
            return (true, "Category deleted");
        }

        private static CategoryDto MapToDto(Category c) => new()
        {
            CategoryId = c.CategoryId,
            CategoryName = c.CategoryName,
            CreatedDate = c.CreatedDate
        };
    }

    public interface IDashboardService
    {
        DashboardDto GetDashboard();
    }

    public class DashboardService : IDashboardService
    {
        private readonly InMemoryDatabase _db;

        public DashboardService(InMemoryDatabase db) => _db = db;

        public DashboardDto GetDashboard()
        {
            var lowStock = _db.Products.Where(p => p.Quantity <= 5).ToList();
            var recent = _db.Products.OrderByDescending(p => p.CreatedDate).Take(5).ToList();
            var catStats = _db.Categories.Select(c => new CategoryStatsDto
            {
                CategoryName = c.CategoryName,
                ProductCount = _db.Products.Count(p => p.CategoryId == c.CategoryId)
            }).ToList();

            return new DashboardDto
            {
                TotalProducts = _db.Products.Count,
                TotalCategories = _db.Categories.Count,
                LowStockCount = lowStock.Count,
                TotalUsers = _db.Users.Count,
                TotalInventoryValue = _db.Products.Sum(p => p.Price * p.Quantity),
                LowStockProducts = lowStock.Select(p => new ProductDto
                {
                    Id = p.Id, ProductName = p.ProductName, CategoryId = p.CategoryId,
                    CategoryName = p.CategoryName, Quantity = p.Quantity, Price = p.Price,
                    Description = p.Description, ProductImage = p.ProductImage,
                    CreatedDate = p.CreatedDate, UpdatedDate = p.UpdatedDate
                }).ToList(),
                RecentProducts = recent.Select(p => new ProductDto
                {
                    Id = p.Id, ProductName = p.ProductName, CategoryId = p.CategoryId,
                    CategoryName = p.CategoryName, Quantity = p.Quantity, Price = p.Price,
                    Description = p.Description, ProductImage = p.ProductImage,
                    CreatedDate = p.CreatedDate, UpdatedDate = p.UpdatedDate
                }).ToList(),
                CategoryStats = catStats
            };
        }
    }
}
