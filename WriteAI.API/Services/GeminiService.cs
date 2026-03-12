using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using WriteAI.API.Interfaces;

namespace WriteAI.API.Services;

public class GeminiService : IGeminiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    private const string BaseUrl =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent";

    public GeminiService(IConfiguration configuration, HttpClient httpClient)
    {
        _apiKey = configuration["GeminiSettings:ApiKey"]!;
        _httpClient = httpClient;
    }

    public async IAsyncEnumerable<string> ImproveWritingAsync(string text)
    {
        var prompt = $"""
            Improve the following text. Make it clearer, more professional and engaging.
            Rules:
            - Return only the improved text
            - No explanations, no comments
            - Keep the same language as the original text

            Text:
            {text}
            """;
        await foreach (var chunk in StreamAsync(prompt))
            yield return chunk;
    }

    public async IAsyncEnumerable<string> SummarizeAsync(string text)
    {
        var prompt = $"""
            Summarize the following text concisely.
            Rules:
            - Return only the summary
            - Maximum 3 sentences
            - No explanations, no comments
            - Keep the same language as the original text

            Text:
            {text}
            """;
        await foreach (var chunk in StreamAsync(prompt))
            yield return chunk;
    }

    public async IAsyncEnumerable<string> GenerateIdeasAsync(string text)
    {
        var prompt = $"""
            Based on the following text, generate exactly 5 short ideas to expand it.
            Rules:
            - Each idea must be 1 sentence only
            - Return a numbered list (1-5)
            - Do not write paragraphs
            - Do not explain anything
            - Keep the same language as the original text

            Text:
            {text}
            """;
        await foreach (var chunk in StreamAsync(prompt))
            yield return chunk;
    }

    private async IAsyncEnumerable<string> StreamAsync(
        string prompt,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            }
        };

        var json = JsonSerializer.Serialize(requestBody);

        var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"{BaseUrl}?key={_apiKey}&alt=sse")
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };

        var response = await _httpClient.SendAsync(
            request,
            HttpCompletionOption.ResponseHeadersRead,
            cancellationToken);

        response.EnsureSuccessStatusCode();

        using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var reader = new StreamReader(stream);

        while (!reader.EndOfStream && !cancellationToken.IsCancellationRequested)
        {
            var line = await reader.ReadLineAsync(cancellationToken);

            if (string.IsNullOrWhiteSpace(line) || !line.StartsWith("data: "))
                continue;

            var data = line["data: ".Length..];

            if (data == "[DONE]")
                break;

            string? text = null;

            try
            {
                using var doc = JsonDocument.Parse(data);
                text = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();
            }
            catch
            {
                continue;
            }

            if (!string.IsNullOrEmpty(text))
                yield return text;
        }
    }
}