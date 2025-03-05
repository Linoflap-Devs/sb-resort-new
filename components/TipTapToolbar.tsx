"use client";
import { type Editor } from "@tiptap/react";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListOrdered,
  List,
  Heading,
} from "lucide-react";
import { Toggle } from "./ui/toggle";
export default function TipTapToolbar({
  editor,
  size = 16,
}: {
  editor: Editor | null;
  size?: number;
}) {
  return (
    <div className="border-1.5 flex gap-1 rounded-md bg-white p-1">
      <Toggle
        variant={"outline"}
        value="heading"
        aria-label="Toggle heading"
        pressed={editor?.isActive("heading")}
        onPressedChange={(value) =>
          editor?.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        <Heading size={size} />
      </Toggle>
      <Toggle
        variant={"outline"}
        value="bold"
        aria-label="Toggle bold"
        pressed={editor?.isActive("bold")}
        onPressedChange={(value) => editor?.chain().focus().toggleBold().run()}
      >
        <BoldIcon size={size} />
      </Toggle>
      <Toggle
        variant={"outline"}
        value="italic"
        aria-label="Toggle italic"
        pressed={editor?.isActive("italic")}
        onPressedChange={(value) =>
          editor?.chain().focus().toggleItalic().run()
        }
      >
        <ItalicIcon size={size} />
      </Toggle>
      <Toggle
        variant={"outline"}
        value="strikethrough"
        aria-label="Toggle strikethrough"
        pressed={editor?.isActive("strike")}
        onPressedChange={(value) =>
          editor?.chain().focus().toggleUnderline().run()
        }
      >
        <UnderlineIcon size={size} />
      </Toggle>
      <Toggle
        variant={"outline"}
        value="unorderedList"
        aria-label="Toggle unordered list"
        pressed={editor?.isActive("bulletList")}
        onPressedChange={(value) =>
          editor?.chain().focus().toggleOrderedList().run()
        }
      >
        <List size={size} />
      </Toggle>
    </div>
  );
}
