// src/Tiptap.jsx
import {
  useEditor,
  EditorContent,
  FloatingMenu,
  BubbleMenu,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TipTapToolbar from "./TipTapToolbar";
import Heading from "@tiptap/extension-heading";
import OList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";

const Tiptap = ({ value, onChange, placeholder }: any) => {
  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({}),
        Underline,
        Heading.configure({
          HTMLAttributes: {
            class: "text-2xl font-bold h-min",
            levels: [2],
          },
        }),
        ListItem.configure({
          HTMLAttributes: {
            class: "list-disc before:content-['•'] flex gap-2 pl-2",
          },
        }),
        Placeholder.configure({
          placeholder: placeholder,
          emptyEditorClass: "is-editor-empty",
        }),
      ],

      content: value,
      editorProps: {
        attributes: {
          class:
            "rounded-md border h-52 border-input bg-white p-2 overflow-auto before:content-w-min w-100",
        },
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        if (html !== value) {
          onChange(editor.getHTML());
        }
        console.log(editor.getHTML());
      },
    },
    [],
  );

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className="flex flex-col gap-2">
      <TipTapToolbar editor={editor} />
      <EditorContent editor={editor} />
      <style jsx global>{`
        .is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default Tiptap;
