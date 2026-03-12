// src/hooks/useAutosave.ts
import { useEffect, useRef } from "react";
import api from "@/lib/api";

export function useAutosave(documentId: string, content: string) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>(content);

  useEffect(() => {
    if (content === lastSavedRef.current) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        await api.put(`/api/documents/${documentId}/content`, { content });
        lastSavedRef.current = content;
      } catch {
        console.error("Autosave failed");
      }
    }, 1000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [content, documentId]);
}