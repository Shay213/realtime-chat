"use client";

import { chatHrefConstructor } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface SidebarChatListProps {
  friends: User[];
  sessionId: string;
}

const SidebarChatList = ({ friends, sessionId }: SidebarChatListProps) => {
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.includes("chat")) {
      setUnseenMessages((prev) =>
        prev.filter((msg) => !pathname.includes(msg.senderId))
      );
    }
  }, [pathname]);

  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {friends.sort().map((f) => {
        const unseenMessagesCount = unseenMessages.filter(
          (msg) => msg.senderId === f.id
        ).length;
        return (
          <li key={f.id}>
            <a
              href={`/dashboard/chat/${chatHrefConstructor(sessionId, f.id)}`}
              className="
                  text-gray-700 hover:text-indigo-600 hover:bg-gray-50 
                  group flex items-center gap-x-3 rounded-md p-2 text-sm 
                  leading-6 font-semibold
                "
            >
              {f.name}
              {unseenMessagesCount > 0 && (
                <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                  {unseenMessagesCount}
                </div>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarChatList;
