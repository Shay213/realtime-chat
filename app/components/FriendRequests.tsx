"use client";

import axios from "axios";
import { Check, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

interface FriendRequestsProps {
  incomingFriendRequests: IncomingFriendRequest[];
  sessionId: string;
}

const FriendRequests = ({
  incomingFriendRequests,
  sessionId,
}: FriendRequestsProps) => {
  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
    []
  );
  const router = useRouter();

  useEffect(() => {
    setFriendRequests(incomingFriendRequests);
  }, [incomingFriendRequests]);

  const acceptFriend = useCallback(
    async (senderId: string) => {
      await axios.post("/api/friend/accept", { id: senderId });
      setFriendRequests((prev) =>
        prev.filter((el) => el.senderId !== senderId)
      );
      router.refresh();
    },
    [router]
  );

  const denyFriend = useCallback(
    async (senderId: string) => {
      await axios.post("/api/friend/deny", { id: senderId });
      setFriendRequests((prev) =>
        prev.filter((el) => el.senderId !== senderId)
      );
      router.refresh();
    },
    [router]
  );

  return (
    <>
      {friendRequests.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here.</p>
      ) : (
        friendRequests.map((req) => (
          <div key={req.senderId} className="flex gap-4 items-center">
            <UserPlus className="text-black" />
            <p className="font-medium text-lg">{req.senderEmail}</p>
            <button
              onClick={() => acceptFriend(req.senderId)}
              aria-label="accept friend"
              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
            >
              <Check className="font-semibold text-white w-3/4 h-3/4" />
            </button>
            <button
              onClick={() => denyFriend(req.senderId)}
              aria-label="deny friend"
              className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
            >
              <X className="font-semibold text-white w-3/4 h-3/4" />
            </button>
          </div>
        ))
      )}
    </>
  );
};

export default FriendRequests;
