"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
const db_1 = require("./db");
const roomRouter_1 = __importDefault(require("./roomRouter"));
const socketServer_1 = __importDefault(require("./socketServer"));
const userRouter_1 = __importDefault(require("./userRouter"));
const port = process.env.PORT || 3000;
const app = (0, express_1.default)();
const server = (0, node_http_1.createServer)(app);
(0, db_1.connectDB)();
// console.log(
//   "jwt key: ",
//   process.env.JWT_PRIVATE_KEY || ""
// );
app.use(express_1.default.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
(0, socketServer_1.default)(io);
app.get("/api/test", (req, res) => res.send("Express on Vercel"));
app.use("/api/user", userRouter_1.default);
app.use("/api/room", roomRouter_1.default);
server.listen(port, () => {
    console.log("server running at http://localhost:" + port);
});
module.exports = app;
