// Services/DocumentService.cs
using Microsoft.EntityFrameworkCore;
using WriteAI.API.Data;
using WriteAI.API.DTOs.Documents;
using WriteAI.API.Interfaces;
using WriteAI.API.Models;

namespace WriteAI.API.Services;

public class DocumentService : IDocumentService
{
    private readonly AppDbContext _context;

    public DocumentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<DocumentResponse>> GetAllAsync(Guid userId)
    {
        return await _context.Documents
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.UpdatedAt)
            .Select(d => ToResponse(d))
            .ToListAsync();
    }

    public async Task<DocumentResponse> GetByIdAsync(Guid id, Guid userId)
    {
        var document = await _context.Documents
            .FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId)
            ?? throw new Exception("Document not found.");

        return ToResponse(document);
    }

    public async Task<DocumentResponse> CreateAsync(Guid userId, CreateDocumentRequest request)
    {
        var document = new Document
        {
            Title = request.Title,
            Content = string.Empty,
            UserId = userId
        };

        _context.Documents.Add(document);
        await _context.SaveChangesAsync();

        return ToResponse(document);
    }

    public async Task<DocumentResponse> UpdateTitleAsync(Guid id, Guid userId, UpdateTitleRequest request)
    {
        var document = await _context.Documents
            .FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId)
            ?? throw new Exception("Document not found.");

        document.Title = request.Title;
        document.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return ToResponse(document);
    }

    public async Task<DocumentResponse> UpdateContentAsync(Guid id, Guid userId, UpdateContentRequest request)
    {
        var document = await _context.Documents
            .FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId)
            ?? throw new Exception("Document not found.");

        document.Content = request.Content;
        document.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return ToResponse(document);
    }

    public async Task DeleteAsync(Guid id, Guid userId)
    {
        var document = await _context.Documents
            .FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId)
            ?? throw new Exception("Document not found.");

        _context.Documents.Remove(document);
        await _context.SaveChangesAsync();
    }

    private static DocumentResponse ToResponse(Document document) => new()
    {
        Id = document.Id,
        Title = document.Title,
        Content = document.Content,
        CreatedAt = document.CreatedAt,
        UpdatedAt = document.UpdatedAt
    };
}