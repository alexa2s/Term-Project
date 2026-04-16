export interface User {
  id: number;
  uname: string;
  password: string;
}

export interface Post {
  id: number;
  title: string;
  link: string;
  description: string;
  creator: number;
  subgroup: string;
  timestamp: number;
}

export interface Comment {
  id: number;
  post_id: number;
  creator: number;
  description: string;
  timestamp: number;
}

export interface Vote {
  user_id: number;
  post_id: number;
  value: number; // +1 or -1
}

export interface DecoratedPost extends Omit<Post, "creator"> {
  creator: User;
  votes: Vote[];
  comments: Array<DecoratedComment>;
}

export interface DecoratedComment extends Omit<Comment, "creator"> {
  creator: User;
}
