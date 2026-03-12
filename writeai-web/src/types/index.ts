// src/types/index.ts
export interface User {
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentRequest {
  title: string;
}
