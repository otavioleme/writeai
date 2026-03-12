using WriteAI.API.DTOs.Documents;

namespace WriteAI.API.Interfaces;

public interface IDocumentService
{
    Task<List<DocumentResponse>> GetAllAsync(Guid userId);
    Task<DocumentResponse> GetByIdAsync(Guid id, Guid userId);
    Task<DocumentResponse> CreateAsync(Guid userId, CreateDocumentRequest request);
    Task<DocumentResponse> UpdateTitleAsync(Guid id, Guid userId, UpdateTitleRequest request);
    Task<DocumentResponse> UpdateContentAsync(Guid id, Guid userId, UpdateContentRequest request);
    Task DeleteAsync(Guid id, Guid userId);
}