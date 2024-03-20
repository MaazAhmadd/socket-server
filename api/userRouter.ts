import express, { NextFunction, Request, Response } from "express";
const router = express.Router();
import { User } from "./models";
import jwt from "jsonwebtoken";
import Mongoose from "mongoose";

// middleware to check if x-auth-token token attached and valid
const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["x-auth-token"];
  if (!token)
    return res.status(401).json({ error: "Access denied. No token provided." });
  try {
    const decoded = jwt.verify(
      token as string,
      process.env.JWT_PRIVATE_KEY || ""
    );
    (req as any).user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ error: "Invalid token." });
  }
};

// Create user
router.post("/register", async (req: Request, res: Response) => {
  try {
    console.log("register router body: ", req.body);
    const { name, handle, profilePicture, password } = req.body;
    let user = new User({ name, handle, profilePicture, password });
    await user.save();

    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});
// Update user by id or handle whatever is provided
router.put("/updateuser/:id", auth, async (req: Request, res: Response) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "handle", "profilePicture", "password"];
  const isValidOperation = updates.some((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    let user: any;
    if (Mongoose.Types.ObjectId.isValid(req.params.id)) {
      user = await User.findById(req.params.id);
    } else {
      user = await User.findOne({ handle: req.params.id });
    }
    if (!user) {
      return res.status(404).send('User not found');
    }

    updates.forEach((update) => ((user as any)[update] = req.body[update]));

    await user.save();

    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Send Friend Request
router.get(
  "/sendFriendRequest/:senderId/:receiverId",
  auth,
  async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.params.senderId);
      const friend = await User.findById(req.params.receiverId);
      if (!user || !friend) {
        return res.status(404).send();
      }

      if (!friend.friendRequests.includes(user._id)) {
        friend.friendRequests.push(user._id);
        await friend.save();
      }

      res.send(friend);
    } catch (e) {
      res.status(500).send();
    }
  }
);
// Accept Friend Request
router.get(
  "/acceptFriendRequest/:senderId/:receiverId",
  auth,
  async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.params.senderId);
      const friend = await User.findById(req.params.receiverId);
      if (!user || !friend) {
        return res.status(404).send();
      }

      if (friend.friendRequests.includes(user._id)) {
        friend.friendRequests.pull(user._id);
        friend.friends.push(user._id);
        user.friends.push(friend._id);
        await friend.save();
        await user.save();
      }

      res.send({ user, friend });
    } catch (e) {
      res.status(500).send();
    }
  }
);
// Get a single user by ID or handle
router.get("/getuser/:id", auth, async (req: Request, res: Response) => {
  try {
    let user: any;
    if (Mongoose.Types.ObjectId.isValid(req.params.id)) {
      user = await User.findById(req.params.id).select("-password");
    } else {
      user = await User.findOne({ handle: req.params.id }).select("-password");
    }
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get all users
router.get("/all", auth, async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select("-password");
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Search users by name or handle
// /api/user
router.get("/search", auth, async (req: Request, res: Response) => {
  console.log("search query: ", req.query.q);
  try {
    const query = req.query.q;
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { handle: { $regex: query, $options: "i" } },
      ],
    }).select("name handle profilePicture");
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

// login user
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { handle, password } = req.body;
    const user = await User.findOne({ handle });
    if (!user) {
      return res.status(400).send({ error: "Invalid handle or password" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).send({ error: "Invalid handle or password" });
    }
    res.send(user.generateAuthToken());
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
