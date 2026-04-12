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
  
  
  const subposts  = getPosts(20, subname);
  const decoratedPosts = subposts.map(post => decoratePost(post));

 
  res.render("sub", {  name: subname, subpost: decoratedPosts  })});

export default router;
