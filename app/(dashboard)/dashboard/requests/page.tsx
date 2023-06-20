import FriendRequests from "@/app/components/FriendRequests";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import React from "react";

const Requests = async () => {
  const session = await getServerSession(authOptions);

  if (!session) return notFound();

  const incomingSenderIds = (await fetchRedis(
    "smembers",
    `user:${session.user.id}:incoming_friend_requests`
  )) as string[];

  const incomingFriendRequestsPromises = incomingSenderIds.map((senderId) =>
    fetchRedis("get", `user:${senderId}`)
  );

  const incomingFriendRequests = await Promise.all(
    incomingFriendRequestsPromises
  );

  const mappedIncomingFriendRequests = incomingFriendRequests.map((el) => ({
    senderId: JSON.parse(el).id as string,
    senderEmail: JSON.parse(el).email as string,
  }));

  return (
    <main className="pt-8">
      <h1 className="font-bold text-5xl mb-8">Friend requests</h1>
      <div className="flex flex-col gap-4">
        <FriendRequests
          sessionId={session.user.id}
          incomingFriendRequests={mappedIncomingFriendRequests}
        />
      </div>
    </main>
  );
};

export default Requests;
