import { AccessToken } from "livekit-server-sdk";

export async function createLiveKitToken(roomName: string, participantName: string): Promise<string> {
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    { identity: participantName, ttl: "2h" }
  );
  at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
  return await at.toJwt();
}
