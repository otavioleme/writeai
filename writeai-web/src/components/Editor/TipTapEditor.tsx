"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onEditorReady?: (editor: { getHTML: () => string; setContent: (html: string) => void }) => void;
  isDark?: boolean;
}

export default function TipTapEditor({ content, onChange, onEditorReady, isDark }: TipTapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing... or select text to use AI",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose max-w-none focus:outline-none min-h-[500px] px-8 py-6",
      },
    },
  });

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady({
        getHTML: () => editor.getHTML(),
        setContent: (html: string) => editor.commands.setContent(html),
      });
    }
  }, [editor, onEditorReady]);

  if (!editor) return null;

  const textSecondary = isDark ? "#94a3b8" : "#6b7280";
  const activeBg = isDark ? "#1e3a5f" : "#dbeafe";
  const activeColor = isDark ? "#93c5fd" : "#1d4ed8";
  const hoverBg = isDark ? "#334155" : "#f3f4f6";

  return (
    <div>
      {/* Toolbar */}
      <div style={{ borderBottom: `1px solid ${isDark ? "#334155" : "#f3f4f6"}` }} className="flex items-center gap-1 px-4 py-2">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold" activeBg={activeBg} activeColor={activeColor} hoverBg={hoverBg} textColor={textSecondary}>
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic" activeBg={activeBg} activeColor={activeColor} hoverBg={hoverBg} textColor={textSecondary}>
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough" activeBg={activeBg} activeColor={activeColor} hoverBg={hoverBg} textColor={textSecondary}>
          <s>S</s>
        </ToolbarButton>

        <div style={{ backgroundColor: isDark ? "#334155" : "#e5e7eb" }} className="w-px h-5 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1" activeBg={activeBg} activeColor={activeColor} hoverBg={hoverBg} textColor={textSecondary}>
          H1
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2" activeBg={activeBg} activeColor={activeColor} hoverBg={hoverBg} textColor={textSecondary}>
          H2
        </ToolbarButton>

        <div style={{ backgroundColor: isDark ? "#334155" : "#e5e7eb" }} className="w-px h-5 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List" activeBg={activeBg} activeColor={activeColor} hoverBg={hoverBg} textColor={textSecondary}>
          ≡
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered List" activeBg={activeBg} activeColor={activeColor} hoverBg={hoverBg} textColor={textSecondary}>
          1.
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({ onClick, active, title, children, activeBg, activeColor, hoverBg, textColor }: {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
  activeBg: string;
  activeColor: string;
  hoverBg: string;
  textColor: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        backgroundColor: active ? activeBg : "transparent",
        color: active ? activeColor : textColor,
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = hoverBg; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = "transparent"; }}
      className="px-2.5 py-1 rounded text-sm transition"
    >
      {children}
    </button>
  );
}