import { EditorPosition } from "obsidian";

export interface Comment {
    publisher: string;
    time: string;
    content: string;
    mentions: string[];
}

export interface TextComment extends Comment{
    file_path: string;
    text_id: string;
    original_text: string;
    pos_st: EditorPosition;
    pos_ed: EditorPosition;
}