import express, { Request, Response } from "express";
import { ensureAuthenticated } from "../middleware/checkAuth";
import { getComment, deleteComment, addComment, editComment, setCommentVote } from "../fake-db"; 

const router = express.Router();

// Helper to handle Passport returning either a raw number OR an object
const getUserId = (user: any) => {
  return typeof user === "object" && user !== null ? user.id : Number(user);
};

// 1. CREATE COMMENT
router.post("/comment-create/:postid", ensureAuthenticated, async (req: Request, res: Response, next) => {
  // const userId = getUserId(req.user);
  const user = await req.user
  const postid = req.params.postid;
  const { description } = req.body;

  if (!description || description.trim() === "") {
    return res.status(400).send("Comment cannot be empty.");
  }

  addComment(postid, user.id, description.trim());
  res.redirect(`/posts/show/${postid}`);
});

// 2. DELETE CONFIRM PAGE (GET)
router.get("/deleteconfirm/:commentid", ensureAuthenticated, async (req: Request, res: Response) => {
  const userId = getUserId(req.user);
  const commentid = req.params.commentid;
  const comment = getComment(commentid);

  if (!comment) return res.status(404).send("Comment not found.");
  if (userId !== comment.creator) return res.status(403).send("You are not authorized.");

  res.render("deleteCommentConfirm", { comment, user: req.user });
});

// 3. DELETE ACTION (POST)
router.post("/delete/:commentid", ensureAuthenticated, async (req: Request, res: Response) => {
  const userId = getUserId(req.user);
  const commentid = req.params.commentid;
  const comment = getComment(commentid);
  
  if (!comment) return res.status(404).send("Comment doesn't exist");
  if (userId !== comment.creator) return res.status(403).send("You can't delete someone else's comment");
  
  const postid = comment.post_id;
  deleteComment(commentid);
  res.redirect(`/posts/show/${postid}`);
});

// 4. EDIT FORM PAGE (GET)
router.get("/edit/:commentid", ensureAuthenticated, async (req: Request, res: Response) => {
  const userId = getUserId(req.user);
  const commentid = req.params.commentid;
  const comment = getComment(commentid);

  if (!comment) return res.status(404).send("Comment not found.");
  if (userId !== comment.creator) return res.status(403).send("You are not authorized to edit this comment.");

  res.render("editComment", { comment, user: req.user });
});

// 5. EDIT ACTION (POST)
router.post("/edit/:commentid", ensureAuthenticated, async (req: Request, res: Response) => {
  const userId = getUserId(req.user);
  const commentid = req.params.commentid;
  const comment = getComment(commentid);

  if (!comment) return res.status(404).send("Comment not found.");
  if (userId !== comment.creator) return res.status(403).send("You are not authorized to edit this comment.");

  const { description } = req.body;
  if (!description || description.trim() === "") return res.status(400).send("Comment cannot be empty.");

  editComment(commentid, description.trim());
  res.redirect(`/posts/show/${comment.post_id}`);
});

// voting on comments

router.post("/vote", ensureAuthenticated, async (req: Request, res: Response) => {
  const userId = getUserId(req.user);
  const {comment_id, setvoteto} = req.body;
  setCommentVote(comment_id,userId,setvoteto);
  res.redirect("back")
});

export default router;