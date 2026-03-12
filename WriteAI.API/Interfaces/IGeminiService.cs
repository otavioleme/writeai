// Interfaces/IGeminiService.cs
namespace WriteAI.API.Interfaces;

public interface IGeminiService
{
    IAsyncEnumerable<string> ImproveWritingAsync(string text);
    IAsyncEnumerable<string> SummarizeAsync(string text);
    IAsyncEnumerable<string> GenerateIdeasAsync(string text);
}