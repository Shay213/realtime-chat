import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { addFriendValidator } from "@/lib/validations/add-friend";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = addFriendValidator.parse(body);

    const id = await fetchRedis("get", `user:email:${email}`);

    if (!id) {
      return new NextResponse(
        JSON.stringify({ message: "This person does not exist" }),
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    if (id === session.user.id) {
      return new NextResponse(
        JSON.stringify({ message: "You cannot add yourself as a friend" }),
        { status: 400 }
      );
    }

    const isAlreadyAdded = await fetchRedis(
      "sismember",
      `user:${id}:incoming_friend_requests`,
      session.user.id
    );

    if (isAlreadyAdded) {
      return new NextResponse(
        JSON.stringify({ message: "You already added this user" }),
        { status: 400 }
      );
    }

    const isAlreadyFriends = await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      id
    );

    if (isAlreadyFriends) {
      return new NextResponse(
        JSON.stringify({ message: "This user is already your friend" }),
        { status: 400 }
      );
    }

    pusherServer.trigger(
      toPusherKey(`user:${id}:incoming_friend_requests`),
      "incoming_friend_requests",
      {
        senderId: session.user.id,
        senderEmail: session.user.email,
      }
    );

    db.sadd(`user:${id}:incoming_friend_requests`, session.user.id);

    return new NextResponse(
      JSON.stringify({ message: "Friend request sended successfully" }),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid request payload" }),
        { status: 422 }
      );
    }

    return new NextResponse(JSON.stringify({ message: "Invalid request" }), {
      status: 400,
    });
  }
}
