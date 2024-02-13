import mitt from "mitt";
import { Comment, TextComment } from "./Comment";
type Events = {
  "submit-comment": Comment;
  "delete-comment": number;
  "open-comment": TextComment;
  //"delete-comment": {del_text_id: number, del_index: number};
};

const emitter = mitt<Events>();
export default emitter;
