import mitt from "mitt";
import { Comment } from "./Comment";
type Events = {
  "submit-comment": Comment;
  "delete-comment": number;
  //"delete-comment": {del_text_id: number, del_index: number};
};

const emitter = mitt<Events>();
export default emitter;
