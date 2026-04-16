import express, { Request, Response } from "express";
import * as database from "../controller/postController";
import { ensureAuthenticated } from "../middleware/checkAuth";
import { getPost, addPost, editPost, deletePost, getUser, getUserByUsername } from "../fake-db";

import { DecoratedPost } from "../types";

const router = express.Router();

// GET /posts — homepage listing of most recent 20 posts
router.get("/", async (req: Request, res: Response) => {
  const posts = await database.getPosts(20);
  const user = req.user as any;
  res.render("posts", { posts, user });
});

// GET /posts/create — form for creating a new post
router.get("/create", ensureAuthenticated, (req: Request, res: Response) => {
  const user = req.user as any;
  res.render("createPosts", { user });
});

// POST /posts/create — process post creation
// POST /posts/create — process post creation
router.post("/create", ensureAuthenticated, async (req: Request, res: Response) => {
  const user = req.user as any;
  const { title, link, description, subgroup } = req.body;

  // 🚨 ULTIMATE FIX: Determine the exact ID no matter what Passport throws at us
  let userId;
  if (user && user.id) {
    userId = user.id; // It's a perfect object
  } else if (user && user.uname) {
    userId = getUserByUsername(user.uname).id; // It has a username but no ID
  } else {
    userId = Number(user); // It's just a raw number
  }

  // Validation: title is required
  if (!title || title.trim() === "") {
    return res.status(400).send("Post must have a title.");
  }

  // Validation: must have at least a link or a description
  if ((!link || link.trim() === "") && (!description || description.trim() === "")) {
    return res.status(400).send("Post must have either a link or a description.");
  }

  // Validation: subgroup is required
  if (!subgroup || subgroup.trim() === "") {
    return res.status(400).send("Post must belong to a subgroup.");
  }

  // Use the safe userId here
  const newPost = addPost(title.trim(), link.trim(), userId, description.trim(), subgroup.trim().toLowerCase());
  
  res.redirect(`/posts/show/${newPost.id}`);
});
// GET /posts/show/:postid — view a single post with its comments


router.get("/show/:postid", async (req: Request, res: Response) => {
  const postid = req.params.postid;
  const post = getPost(postid) as DecoratedPost;

  // 🚨 FIX: Turn the raw Passport ID into a full user object for EJS!
  let user = req.user as any;
  if (user && typeof user !== "object") {
    user = getUser(Number(user));
  }

  if (!post) {
    return res.status(404).send("Post not found.");
  }

  res.render("individualPost", { post, user });
});

// GET /posts/edit/:postid — form to edit an existing post (owner only)
router.get("/edit/:postid", ensureAuthenticated, async (req: Request, res: Response) => {
  const user = req.user as any;
  const postid = req.params.postid;
  const post = getPost(postid) as DecoratedPost;

  if (!post) {
    return res.status(404).send("Post not found.");
  }

  // Only the creator can edit
  if (user.id !== post.creator.id) {
    return res.status(403).send("You are not authorized to edit this post.");
  }

  res.render("editPost", { post, user });
});

// POST /posts/edit/:postid — save edits (owner only)
router.post("/edit/:postid", ensureAuthenticated, async (req: Request, res: Response) => {
  const user = req.user as any;
  const postid = req.params.postid;
  const post = getPost(postid) as DecoratedPost;

  if (!post) {
    return res.status(404).send("Post not found.");
  }

  // Only the creator can edit
  if (user.id !== post.creator.id) {
    return res.status(403).send("You are not authorized to edit this post.");
  }

  const { title, link, description, subgroup } = req.body;

  // Validation: title is required
  if (!title || title.trim() === "") {
    return res.status(400).send("Post must have a title.");
  }

  editPost(Number(postid), {
    title: title.trim(),
    link: link.trim(),
    description: description.trim(),
    subgroup: subgroup.trim().toLowerCase(),
  });

  res.redirect(`/posts/show/${postid}`);
});

// GET /posts/deleteconfirm/:postid — confirm delete page (owner only)
router.get("/deleteconfirm/:postid", ensureAuthenticated, async (req: Request, res: Response) => {
  const user = req.user as any;
  const postid = req.params.postid;
  const post = getPost(postid) as DecoratedPost;

  if (!post) {
    return res.status(404).send("Post not found.");
  }

  // Only the creator can delete
  if (user.id !== post.creator.id) {
    return res.status(403).send("You are not authorized to delete this post.");
  }

  res.render("deleteConfirm", { post, user });
});

// POST /posts/delete/:postid — perform deletion (owner only)
router.post("/delete/:postid", ensureAuthenticated, async (req: Request, res: Response) => {
  const user = req.user as any;
  const postid = req.params.postid;
  const post = getPost(postid) as DecoratedPost;

  if (!post) {
    return res.status(404).send("Post not found.");
  }

  // Only the creator can delete
  if (user.id !== post.creator.id) {
    return res.status(403).send("You are not authorized to delete this post.");
  }

  const subgroup = post.subgroup;
  deletePost(Number(postid));
  res.redirect(`/subs/show/${subgroup}`);
});





export default router;
