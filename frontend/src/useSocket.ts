import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// 👇 Change this to your backend URL when deployed
const BACKEND_URL = (import.meta.env["VITE_BACKEND_URL"] as string) || "http://localhost:3001";

interface State {
  count: number;
  lastPressed: number | null;
  lastMessage: string | null;
}

interface PressEvent {
  count: number;
  lastPressed: number;
  message: string;
  milestone?: string | null;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [state, setState] = useState<State>({ count: 0, lastPressed: null, lastMessage: null });
  const [notification, setNotification] = useState<string | null>(null);
  const [myMessage, setMyMessage] = useState<string | null>(null);
  const [remoteAnimating, setRemoteAnimating] = useState(false);
  const [milestone, setMilestone] = useState<string | null>(null);
  const milestoneTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notifTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const socket = io(BACKEND_URL);
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    // Receive current state on connect
    socket.on("state", (data: State) => {
      setState(data);
    });

    // Someone else pressed
    socket.on("someone_pressed", (data: PressEvent) => {
      setState(s => ({ ...s, count: data.count, lastPressed: data.lastPressed }));
      setNotification(data.message);
      setRemoteAnimating(true);
      setTimeout(() => setRemoteAnimating(false), 800);
      if (notifTimeout.current) clearTimeout(notifTimeout.current);
      notifTimeout.current = setTimeout(() => setNotification(null), 4000);
      if (data.milestone) {
        setMilestone(data.milestone);
        if (milestoneTimeout.current) clearTimeout(milestoneTimeout.current);
        milestoneTimeout.current = setTimeout(() => setMilestone(null), 5000);
      }
    });

    // My own press confirmed
    socket.on("press_confirmed", (data: PressEvent) => {
      setState(s => ({ ...s, count: data.count, lastPressed: data.lastPressed }));
      setMyMessage(data.message);
      setTimeout(() => setMyMessage(null), 4000);
      if (data.milestone) {
        setMilestone(data.milestone);
        if (milestoneTimeout.current) clearTimeout(milestoneTimeout.current);
        milestoneTimeout.current = setTimeout(() => setMilestone(null), 5000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const press = () => {
    socketRef.current?.emit("press");
  };

  return { connected, state, notification, myMessage, remoteAnimating, milestone, press };

}
