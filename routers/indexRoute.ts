import express, { Request, Response } from "express";
import { getSubs } from "../fake-db";
const router = express.Router();
router.get("/list", (req,res) => {
  const subs = getSubs()
  subs.sort((a, b) => a.localeCompare(b));
    
    res.render("subsList", { subs });
})

router.get("/", async (req: Request, res: Response) => {
  res.redirect("/posts");
});

export default router;
