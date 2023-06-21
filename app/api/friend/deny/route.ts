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

    await db.srem(`user:${session.user.id}:incoming_friend_requests`, id);

    return new NextResponse(JSON.stringify({ message: "OK" }), {
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
