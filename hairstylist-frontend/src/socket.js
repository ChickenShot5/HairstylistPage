import { io } from "socket.io-client";

const socket = io("http://localhost:4000", {
  withCredentials: true,
  transports: ["websocket"], // enforce stable transport
});

export default socket;