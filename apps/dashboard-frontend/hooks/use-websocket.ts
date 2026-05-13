"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getWSClient, type WSMessage, type WSMessageType, type WSEventHandler } from "@/lib/ws";

export function useWebSocket() {
  const clientRef = useRef(getWSClient());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const client = clientRef.current;
    client.connect();

    const checkConnection = setInterval(() => {
      setIsConnected(client.isConnected);
    }, 1000);

    return () => {
      clearInterval(checkConnection);
      client.disconnect();
    };
  }, []);

  const sendMessage = useCallback((msg: WSMessage) => {
    clientRef.current.send(msg);
  }, []);

  const subscribe = useCallback((type: WSMessageType, handler: WSEventHandler) => {
    clientRef.current.on(type, handler);
    return () => clientRef.current.off(type, handler);
  }, []);

  return { isConnected, sendMessage, subscribe };
}
