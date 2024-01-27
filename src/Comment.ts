export interface Comment {
    // file_path: string
    text_id: number
    publisher: string;
    time: string;
    content: string;
    mentions: string[];
}