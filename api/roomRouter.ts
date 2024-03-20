import express, { Request, Response } from "express";
const router = express.Router();


router.post("/create", async (req: Request, res: Response) => {
  res.status(201).send("room created");
});

export default router;
