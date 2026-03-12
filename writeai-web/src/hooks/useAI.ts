import { useState } from "react";

type AIAction = "improve" | "summarize" | "ideas";

export function useAI() {
  const [loading, setLoading] = useState(false);

  const run = async (action: AIAction, text: string): Promise<string> => {
    setLoading(true);

    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5028";

    try {
      const response = await fetch(`${apiUrl}/api/ai/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (!data || data === "[DONE]") continue;
          fullText += data;
        }
      }

      return fullText;
    } finally {
      setLoading(false);
    }
  };

  return { run, loading };
}