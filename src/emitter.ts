import mitt from "mitt";
import { Comment } from "./Comment";
type Events = {
  "submit-comment": Comment;
};

const emitter = mitt<Events>();
export default emitter;
