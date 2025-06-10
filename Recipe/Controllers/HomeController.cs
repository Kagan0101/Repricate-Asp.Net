using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Recipe.Models;

namespace Recipe.Controllers;

public class HomeController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<HomeController> _logger;

    public HomeController(ApplicationDbContext context, ILogger<HomeController> logger)
    {
        _context = context;
        _logger = logger;
    }

    public IActionResult Index()
    {
        var recipes = _context.Recipes.OrderByDescending(r => r.CreatedAt).ToList();
        return View(recipes);
    }

    // GET: Form sayfasını göster
    public IActionResult Add()
    {
        return View();
    }

    // POST: Form verilerini işle
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Add(Models.Recipe recipe)
    {
        // Debug: Form verilerini görüntüle
        Console.WriteLine("=== FORM VERİLERİ ===");
        Console.WriteLine($"📝 Name: '{recipe.Name}'");
        Console.WriteLine($"📂 Category: '{recipe.Category}'");
        Console.WriteLine($"⭐ Level: '{recipe.Level}'");
        Console.WriteLine($"📄 Description: '{recipe.Description}'");
        Console.WriteLine($"🖼️ ImageUrl: '{recipe.ImageUrl}'");
        Console.WriteLine($"🛒 Ingredients Length: {recipe.Ingredients?.Length ?? 0}");
        Console.WriteLine($"👩‍🍳 Instructions Length: {recipe.Instructions?.Length ?? 0}");
        Console.WriteLine("====================");

        try
        {
            // Model validation kontrolü
            if (ModelState.IsValid)
            {
                // ✅ Veriyi işle ve formatla
                recipe.Name = recipe.Name?.Trim() ?? "";
                recipe.Category = recipe.Category?.Trim() ?? "";
                recipe.Level = recipe.Level?.Trim() ?? "";
                recipe.Description = recipe.Description?.Trim() ?? "";
                recipe.ImageUrl = recipe.ImageUrl?.Trim() ?? "";
                
                // Malzemeleri formatla
                if (!string.IsNullOrEmpty(recipe.Ingredients))
                {
                    var ingredients = recipe.Ingredients
                        .Split('\n', StringSplitOptions.RemoveEmptyEntries)
                        .Select(x => x.Trim())
                        .Where(x => !string.IsNullOrEmpty(x))
                        .Select(x => x.StartsWith("•") ? x : $"• {x}")
                        .ToArray();
                    recipe.Ingredients = string.Join("\n", ingredients);
                }

                // Yapılış adımlarını formatla
                if (!string.IsNullOrEmpty(recipe.Instructions))
                {
                    var steps = recipe.Instructions
                        .Split('\n', StringSplitOptions.RemoveEmptyEntries)
                        .Select((step, index) => 
                        {
                            step = step.Trim();
                            if (!step.StartsWith($"{index + 1}."))
                            {
                                return $"{index + 1}. {step}";
                            }
                            return step;
                        })
                        .ToArray();
                    recipe.Instructions = string.Join("\n", steps);
                }

                // Tarihleri set et
                recipe.CreatedAt = DateTime.Now;
                recipe.UpdatedAt = DateTime.Now;

                // Veritabanına ekle
                _context.Recipes.Add(recipe);
                await _context.SaveChangesAsync();

                Console.WriteLine("✅ Tarif başarıyla kaydedildi!");
                _logger.LogInformation("Yeni tarif eklendi: {RecipeName}", recipe.Name);

                TempData["SuccessMessage"] = $"'{recipe.Name}' başarıyla eklendi! 🎉";
                return RedirectToAction("Index");
            }
            else
            {
                // Validation hatalarını logla
                Console.WriteLine("❌ MODEL GEÇERSİZ:");
                foreach (var error in ModelState)
                {
                    if (error.Value.Errors.Count > 0)
                    {
                        Console.WriteLine($"   {error.Key}: {string.Join(", ", error.Value.Errors.Select(e => e.ErrorMessage))}");
                    }
                }
                
                TempData["ErrorMessage"] = "Lütfen gerekli alanları doldurun!";
                return View(recipe);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ HATA: {ex.Message}");
            Console.WriteLine($"Stack Trace: {ex.StackTrace}");
            
            _logger.LogError(ex, "Tarif eklenirken hata oluştu");
            TempData["ErrorMessage"] = "Bir hata oluştu: " + ex.Message;
            return View(recipe);
        }
    }

    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}