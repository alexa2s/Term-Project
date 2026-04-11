// const { ensureAuthenticated } = require("../middleware/checkAuth");
import express from "express";
import * as database from "../controller/postController";
import { getSubs, getPosts, decoratePost } from "../fake-db";
const router = express.Router();

router.get("/list", async (req, res) => {
  // ⭐ TODO
  const sublist = getSubs()
  
  sublist.sort((a, b) => a.localeCompare(b));
  // res.render("subs");
  res.render("subs", {subs: sublist});
});

router.get("/show/:subname", async (req, res) => {
    // ⭐ TODO
  const subname = req.params.subname as string;
  
  // 1. Get posts and decorate them (so usernames show up)
  const rawPosts = getPosts(20, subname);
  const decoratedPosts = rawPosts.map(post => decoratePost(post));

  // 2. Render "sub" (This matches sub.ejs)
  res.render("sub", { 
    name: subname, 
    subpost: decoratedPosts 
  });
});

export default router;
  // // function getPosts(n = 5, sub = undefined) {
  //   let allPosts = Object.values(posts);
  //   if (sub) {
  //     allPosts = allPosts.filter((post) => post.subgroup === sub);
  //   }
  //   allPosts.sort((a, b) => b.timestamp - a.timestamp);
  //   return allPosts.slice(0, n);
  // }