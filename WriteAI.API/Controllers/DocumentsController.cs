// Controllers/DocumentsController.cs
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WriteAI.API.DTOs.Documents;
using WriteAI.API.Interfaces;

namespace WriteAI.API.Controllers;

[ApiController]
[Route("api/documents")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public DocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var documents = await _documentService.GetAllAsync(GetUserId());
        return Ok(documents);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var document = await _documentService.GetByIdAsync(id, GetUserId());
            return Ok(document);
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateDocumentRequest request)
    {
        var document = await _documentService.CreateAsync(GetUserId(), request);
        return CreatedAtAction(nameof(GetById), new { id = document.Id }, document);
    }

    [HttpPatch("{id}/title")]
    public async Task<IActionResult> UpdateTitle(Guid id, UpdateTitleRequest request)
    {
        try
        {
            var document = await _documentService.UpdateTitleAsync(id, GetUserId(), request);
            return Ok(document);
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPut("{id}/content")]
    public async Task<IActionResult> UpdateContent(Guid id, UpdateContentRequest request)
    {
        try
        {
            var document = await _documentService.UpdateContentAsync(id, GetUserId(), request);
            return Ok(document);
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _documentService.DeleteAsync(id, GetUserId());
            return NoContent();
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}