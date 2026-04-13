// @ts-nocheck
import express from "express";
import * as database from "../controller/postController";
const router = express.Router();
import { ensureAuthenticated } from "../middleware/checkAuth";
import {
  getUser,
  addPost,
  getPost,
  decoratePost,
  editPost,
  deletePost,
  setVote,
  getUserVoteForPost
} from "../fake-db";
router.get("/", async (req, res) => {
  const preposts = await database.getPosts(20);
  const posts = preposts.map(post => decoratePost(post));
  const user = await req.user;

  res.render("posts", { posts, user });
});

router.get("/create", ensureAuthenticated, (req, res) => {
  res.render("createPosts");
});

router.post("/create", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
  const user = await req.user;
  const title = req.body.title;
  const link = req.body.link;
  const description = req.body.description;
  const creator = user.id;

  const subgroup = req.body.subgroup;
  if (!title) {
    return res.status(400).send("Post needs a Title");
  }

  const addp = addPost(title, link, creator, description, subgroup);

  res.redirect(`/posts/show/${addp.id}`);
});

router.get("/show/:postid", async (req, res) => {
  // ⭐ TODO
  const postid = req.params.postid;
  const poststuff = getPost(postid);
  const user = await req.user;

  let userVote = 0

  if (user) {
    userVote = getUserVoteForPost(postid, user.id);
  }

  res.render("individualPost", { post: poststuff, user: user, postid: postid, userVote: userVote });
});

router.get("/edit/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
  const user = await req.user;
  const postid = req.params.postid;
  const poststuff = getPost(postid);
  // const changes = {
  //   title : req.body.title,
  //   link : req.body.link,
  //   description: req.body.description,
  //   subgroup : req.body.subgroup
  // }
  // editPost(postid,changes)
  res.render("edit",{post: poststuff, postid:postid})
});

router.post("/edit/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
  const postid = req.params.postid;
   const changes = {
    title : req.body.title,
    link : req.body.link,
    description: req.body.description,
    subgroup : req.body.subgroup
  }
  editPost(postid,changes)

  res.redirect(`/posts/show/${postid}`);
});

router.get("/deleteconfirm/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
  const user = await req.user;
  const postid = req.params.postid;

  const poststuff = getPost(postid);
  res.render("delete", { post: poststuff });
});

router.post("/delete/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
  const user = await req.user;
  const postid = req.params.postid;
  console.log(postid);
  const post = getPost(postid);
  const subgroup = post.subgroup;
  deletePost(postid);
  res.redirect(`/subs/show/${subgroup}`);
});

router.post("/vote/:postid", ensureAuthenticated, async (req, res) => {
  const postid = req.params.postid;
  const user = await req.user;
  const setvoteto = Number(req.body.setvoteto);
  const returnto = req.body.returnto

  if (setvoteto !== 1 && setvoteto !== -1 && setvoteto !== 0) {
    return res.status(400).send("Invalid vote value");
  }

  setVote(postid, user.id, setvoteto);

  res.redirect(returnto);

});

router.post(
  "/comment-create/:postid",
  ensureAuthenticated,
  async (req, res) => {
    // ⭐ TODO
  },
);

export default router;
