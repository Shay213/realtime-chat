import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id } = z.object({ id: z.string() }).parse(body);

    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const isAlreadyFriends = await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      id
    );
    if (isAlreadyFriends) {
      return new NextResponse(JSON.stringify({ message: "Already friends" }), {
        status: 400,
      });
    }

    const hasFriendRequest = await fetchRedis(
      "sismember",
      `user:${session.user.id}:incoming_friend_requests`,
      id
    );
    if (!hasFriendRequest) {
      return new NextResponse(
        JSON.stringify({ message: "No friend request" }),
        {
          status: 400,
        }
      );
    }

    await db.sadd(`user:${session.user.id}:friends`, id);
    await db.sadd(`user:${id}:friends`, session.user.id);
    await db.srem(`user:${session.user.id}:incoming_friend_requests`, id);

    return new NextResponse(JSON.stringify({ message: "Friend added" }), {
      status: 200,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid request payload" }),
        {
          status: 422,
        }
      );
    }

    return new NextResponse(JSON.stringify({ message: "Invalid request" }), {
      status: 400,
    });
  }
}
