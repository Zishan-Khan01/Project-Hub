export interface CommentUser {
  id: string;
  name: string;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: CommentUser;
}

export interface CreateCommentData {
  content: string;
  taskId: string;
}

export interface UpdateCommentData {
  content: string;
}