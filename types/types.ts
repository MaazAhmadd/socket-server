interface ServerToClientEvents {
  noArg: () => void;
  sendMessage: (value: string) => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  message: (data: string, userId: string) => void;
  joinRoom: ({ roomId, userId }: { roomId: string; userId: string }) => void;
  leaveRoom: () => void;
  roomDesc: (data: Room) => void;
  hello: (d: String, callback: (a: String) => void) => void;
  getRooms: () => void;
  getRoomsResponse: (data: string[]) => void;
  giveLeader: (targetMember: string) => void;
}
// socket.timeout(5000).emit("create-something", value, () => {
//   setIsLoading(false);
// });

interface ClientToServerEvents {
  hello: () => void;
  sendMessage: (value: string, callback: () => void) => void;
  message: (data: string, userId: string) => void;
  joinRoom: ({ roomId, userId }: { roomId: string; userId: string }) => void;
  leaveRoom: () => void;
  getRooms: () => void;
  giveLeader: (targetMember: string) => void;

  roomDesc: (data: Room) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

// type Rooms = Record<string, Room>;
type Rooms = {
  [key: string]: Room;
}


interface Room {
  members: Member[];
  lastEmptyTime: string;
  roomId: string; 
}

interface Member {
  isConnected: boolean;
  isLeader: boolean;
  userId: string | null;
}

export type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  Rooms,
  Member,
  Room,
};
