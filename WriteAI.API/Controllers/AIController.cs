// Controllers/AIController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WriteAI.API.Interfaces;

namespace WriteAI.API.Controllers;

[ApiController]
[Route("api/ai")]
[Authorize]
public class AIController : ControllerBase
{
    private readonly IGeminiService _geminiService;

    public AIController(IGeminiService geminiService)
    {
        _geminiService = geminiService;
    }

    [HttpPost("improve")]
    public async Task StreamImprove([FromBody] AIRequest request)
    {
        await StreamResponse(_geminiService.ImproveWritingAsync(request.Text));
    }

    [HttpPost("summarize")]
    public async Task StreamSummarize([FromBody] AIRequest request)
    {
        await StreamResponse(_geminiService.SummarizeAsync(request.Text));
    }

    [HttpPost("ideas")]
    public async Task StreamIdeas([FromBody] AIRequest request)
    {
        await StreamResponse(_geminiService.GenerateIdeasAsync(request.Text));
    }

    private async Task StreamResponse(IAsyncEnumerable<string> stream)
    {
        Response.ContentType = "text/event-stream";
        Response.Headers["Cache-Control"] = "no-cache";
        Response.Headers["X-Accel-Buffering"] = "no";

        await foreach (var chunk in stream)
        {
            await Response.WriteAsync($"data: {chunk}\n\n");
            await Response.Body.FlushAsync();
        }

        await Response.WriteAsync("data: [DONE]\n\n");
        await Response.Body.FlushAsync();
    }
}

public record AIRequest(string Text);