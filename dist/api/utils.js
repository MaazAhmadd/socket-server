"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.giveLeader = exports.makeMemberJoin = exports.makeMemberLeave = void 0;
function makeMemberLeave(rooms, socket, roomId, userId) {
    let room = rooms[roomId];
    if (!room)
        return;
    // disconnect member
    for (let i = 0; i < room.members.length; i++) {
        let member = room.members[i];
        if (member.userId === userId) {
            member.isConnected = false;
            member.isLeader = false;
            socket.leave(roomId);
            break;
        }
    }
    // if all disconnected
    if (!room.members.find((m) => m.isConnected)) {
        delete rooms[roomId];
    }
    // determine leader
    for (let i = 0; i < room.members.length; i++) {
        let member = room.members[i];
        if (member.isConnected) {
            member.isLeader = true;
            break;
        }
    }
}
exports.makeMemberLeave = makeMemberLeave;
function makeMemberJoin(rooms, socket, roomId, userId) {
    let room = rooms[roomId];
    if (!room) {
        room = {
            members: [
                {
                    isConnected: true,
                    isLeader: true,
                    userId,
                },
            ],
            lastEmptyTime: Date.now().toString(),
            roomId,
        };
        rooms[roomId] = room;
    }
    else if (getUser(rooms, roomId, userId)) {
        if (getUserIndex(rooms, roomId, userId) <
            getCurrentLeaderIndex(rooms, roomId, userId)) {
            getCurrentLeader(rooms, roomId).isLeader = false;
            getUser(rooms, roomId, userId).isLeader = true;
        }
        getUser(rooms, roomId, userId).isConnected = true;
    }
    else {
        rooms[roomId].members.push({
            isConnected: true,
            isLeader: false,
            userId,
        });
    }
    socket.userId = userId;
    socket.roomId = roomId;
    socket.join(roomId);
}
exports.makeMemberJoin = makeMemberJoin;
function getUserIndex(rooms, roomId, userId) {
    return rooms[roomId].members.findIndex((m) => m.userId === userId);
}
function getUser(rooms, roomId, userId) {
    return rooms[roomId].members.find((m) => m.userId === userId);
}
function getCurrentLeader(rooms, roomId) {
    return rooms[roomId].members.find((m) => m.isLeader === true);
}
function getCurrentLeaderIndex(rooms, roomId, userId) {
    return rooms[roomId].members.findIndex((m) => m.isLeader === true);
}
// giveLeader(rooms, socket, roomId, userId, targetMember);
function giveLeader(rooms, socket, roomId, userId, //leader
targetMember) {
    var _a;
    if (!userId || !targetMember)
        return;
    let room = rooms[roomId];
    // check if not leader return
    if (!(((_a = getCurrentLeader(rooms, roomId)) === null || _a === void 0 ? void 0 : _a.userId) === userId)) {
        return;
    }
    getUser(rooms, roomId, targetMember).isLeader = true;
    getUser(rooms, roomId, userId).isLeader = false;
    room.members.splice(0, 0, room.members.splice(getUserIndex(rooms, roomId, targetMember), 1)[0]);
}
exports.giveLeader = giveLeader;
