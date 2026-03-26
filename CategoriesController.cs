using InventoryAPI.DTOs;
using InventoryAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/categories")]
    [Authorize]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoriesController(ICategoryService categoryService) => _categoryService = categoryService;

        [HttpGet]
        public IActionResult GetAll() => Ok(_categoryService.GetAll());

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var cat = _categoryService.GetById(id);
            if (cat == null) return NotFound(new { message = "Category not found" });
            return Ok(cat);
        }

        [HttpPost]
        public IActionResult Create([FromBody] CreateCategoryDto dto)
        {
            var (success, message, data) = _categoryService.Create(dto);
            if (!success) return BadRequest(new { message });
            return CreatedAtAction(nameof(GetById), new { id = data!.CategoryId }, new { message, data });
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] CreateCategoryDto dto)
        {
            var (success, message, data) = _categoryService.Update(id, dto);
            if (!success) return BadRequest(new { message });
            return Ok(new { message, data });
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var (success, message) = _categoryService.Delete(id);
            if (!success) return BadRequest(new { message });
            return Ok(new { message });
        }
    }

    [ApiController]
    [Route("api/dashboard")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService) => _dashboardService = dashboardService;

        [HttpGet]
        public IActionResult GetDashboard() => Ok(_dashboardService.GetDashboard());
    }
}
