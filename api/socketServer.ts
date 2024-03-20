import { Server } from "socket.io";
import {
  ClientToServerEvents,
  InterServerEvents,
  Rooms,
  ServerToClientEvents,
} from "../types/types";
import { giveLeader, makeMemberJoin, makeMemberLeave } from "./utils";
import jwt from "jsonwebtoken";

let rooms: Rooms = {};

export default function socketServer(
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents>
) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake?.query?.token;
      if (typeof token != "string") {
        return next(new Error("Authentication error"));
      }
      const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY || "");
      if (decoded) {
        (socket as any).user = decoded;
        next();
      } else {
        next(new Error("Authentication error"));
      }
    } catch (error) {
      next(new Error("Authentication error: " + error));
    }
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", ({ roomId, userId }) => {
      console.log("joinRoom user object", (socket as any).user);

      makeMemberJoin(rooms, socket, roomId, userId);
      io.in(roomId).emit("roomDesc", rooms[roomId]);
    });

    socket.on("giveLeader", (targetMember) => {
      const userId = (socket as any).userId;
      const roomId = (socket as any).roomId;
      giveLeader(rooms, socket, roomId, userId, targetMember);

      io.in(roomId).emit("roomDesc", rooms[roomId]);
    });
    socket.on("getRooms", () => {
      const rooms = Array.from(socket.rooms);
      socket.emit("getRoomsResponse", rooms);
    });

    socket.on("sendMessage", (data) => {
      const userId = (socket as any).userId;
      const roomId = (socket as any).roomId;

      io.in(roomId).emit("message", data, userId);
    });
    socket.on("leaveRoom", () => {
      const roomId = (socket as any).roomId;
      const userId = (socket as any).userId;

      makeMemberLeave(rooms, socket, roomId, userId);
      io.in(roomId).emit("roomDesc", rooms[roomId]);
    });
    socket.on("disconnect", () => {
      const userId = (socket as any).userId;
      const roomId = (socket as any).roomId;
      console.log("disconnecting", userId, roomId);
      makeMemberLeave(rooms, socket, roomId, userId);
      io.in(roomId).emit("roomDesc", rooms[roomId]);
    });
  });
}
