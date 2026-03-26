using InventoryAPI.DTOs;
using InventoryAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/products")]
    [Authorize]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService) => _productService = productService;

        [HttpGet]
        public IActionResult GetProducts([FromQuery] ProductQueryParams query)
        {
            var result = _productService.GetProducts(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var product = _productService.GetById(id);
            if (product == null) return NotFound(new { message = "Product not found" });
            return Ok(product);
        }

        [HttpPost]
        public IActionResult Create([FromBody] CreateProductDto dto)
        {
            var (success, message, data) = _productService.Create(dto);
            if (!success) return BadRequest(new { message });
            return CreatedAtAction(nameof(GetById), new { id = data!.Id }, new { message, data });
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] CreateProductDto dto)
        {
            var (success, message, data) = _productService.Update(id, dto);
            if (!success) return BadRequest(new { message });
            return Ok(new { message, data });
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var (success, message) = _productService.Delete(id);
            if (!success) return NotFound(new { message });
            return Ok(new { message });
        }
    }
}
