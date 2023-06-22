import { getFriendsByUserId } from "@/helpers/getFriendsByUserId";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { chatHrefConstructor } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

const Dashboard = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return notFound();
  }

  const friends = await getFriendsByUserId(session.user.id);

  const friendsWithLastMessage = await Promise.all(
    friends.map(async (f) => ({
      ...f,
      lastMessage: JSON.parse(
        (
          (await fetchRedis(
            "zrange",
            `chat:${chatHrefConstructor(session.user.id, f.id)}:messages`,
            -1,
            -1
          )) as string[]
        )[0]
      ),
    }))
  );

  return (
    <div className="container py-12">
      <h1 className="font-bold text-5xl mb-8">Recent chats</h1>
      {friendsWithLastMessage.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here...</p>
      ) : (
        friendsWithLastMessage.map((f) => (
          <div
            key={f.id}
            className="relative bg-zinc-50 border border-zinc-200 p-3 rounded-md"
          >
            <div className="absolute right-4 inset-y-0 flex items-center">
              <ChevronRight className="h-7 w-7 text-zinc-400" />
            </div>
            <Link
              href={`/dashboard/chat/${chatHrefConstructor(
                session.user.id,
                f.id
              )}`}
              className="relative sm:flex"
            >
              <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
                <div className="relative h-6 w-6">
                  <Image
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                    alt={`${f.name} profile picture`}
                    src={f.image}
                    fill
                  />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold">{f.name}</h4>
                <p className="mt-1 max-w-md">
                  <span className="text-zinc-400">
                    {f.lastMessage.senderId === session.user.id ? "You: " : ""}
                  </span>
                  {f.lastMessage.text}
                </p>
              </div>
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default Dashboard;
