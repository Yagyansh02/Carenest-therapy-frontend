import Peer from "peerjs";
import { env } from "../config/env";

/**
 * Parses VITE_API_BASE_URL to derive the PeerJS server connection params.
 * The PeerJS server runs on the same host/port as the backend API at /peerjs.
 */
const getPeerServerConfig = () => {
  try {
    const url = new URL(env.apiBaseUrl);
    return {
      host: url.hostname,
      port: Number(url.port) || (url.protocol === "https:" ? 443 : 80),
      path: "/peerjs",
      secure: url.protocol === "https:",
    };
  } catch {
    // Fallback for relative URLs or misconfigured env
    return {
      host: "localhost",
      port: 8000,
      path: "/peerjs",
      secure: false,
    };
  }
};

/**
 * Creates and returns a PeerJS Peer connected to the CareNest signaling server.
 *
 * @param {string} peerId  - The deterministic peer ID to register with.
 * @returns {Peer}
 */
export const createPeer = (peerId) => {
  const config = getPeerServerConfig();
  return new Peer(peerId, {
    ...config,
    debug: env.isDevelopment ? 1 : 0,
    config: {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    },
  });
};

/**
 * Requests camera + microphone access and returns the MediaStream.
 */
export const getLocalStream = () =>
  navigator.mediaDevices.getUserMedia({ video: true, audio: true });
