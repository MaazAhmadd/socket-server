"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
let rooms = {};
function socketServer(io) {
    io.use((socket, next) => {
        var _a, _b;
        try {
            const token = (_b = (_a = socket.handshake) === null || _a === void 0 ? void 0 : _a.query) === null || _b === void 0 ? void 0 : _b.token;
            if (typeof token != "string") {
                return next(new Error("Authentication error"));
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_PRIVATE_KEY || "");
            if (decoded) {
                socket.user = decoded;
                next();
            }
            else {
                next(new Error("Authentication error"));
            }
        }
        catch (error) {
            next(new Error("Authentication error: " + error));
        }
    });
    io.on("connection", (socket) => {
        socket.on("joinRoom", ({ roomId, userId }) => {
            console.log("joinRoom user object", socket.user);
            (0, utils_1.makeMemberJoin)(rooms, socket, roomId, userId);
            io.in(roomId).emit("roomDesc", rooms[roomId]);
        });
        socket.on("giveLeader", (targetMember) => {
            const userId = socket.userId;
            const roomId = socket.roomId;
            (0, utils_1.giveLeader)(rooms, socket, roomId, userId, targetMember);
            io.in(roomId).emit("roomDesc", rooms[roomId]);
        });
        socket.on("getRooms", () => {
            const rooms = Array.from(socket.rooms);
            socket.emit("getRoomsResponse", rooms);
        });
        socket.on("sendMessage", (data) => {
            const userId = socket.userId;
            const roomId = socket.roomId;
            io.in(roomId).emit("message", data, userId);
        });
        socket.on("leaveRoom", () => {
            const roomId = socket.roomId;
            const userId = socket.userId;
            (0, utils_1.makeMemberLeave)(rooms, socket, roomId, userId);
            io.in(roomId).emit("roomDesc", rooms[roomId]);
        });
        socket.on("disconnect", () => {
            const userId = socket.userId;
            const roomId = socket.roomId;
            console.log("disconnecting", userId, roomId);
            (0, utils_1.makeMemberLeave)(rooms, socket, roomId, userId);
            io.in(roomId).emit("roomDesc", rooms[roomId]);
        });
    });
}
exports.default = socketServer;
