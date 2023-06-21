import { fetchRedis } from "./redis";

export const getFriendsByUserId = async (userId: string) => {
  const friendIds = (await fetchRedis(
    "smembers",
    `user:${userId}:friends`
  )) as string[];

  const friends = await Promise.all(
    friendIds.map((friendId) => fetchRedis("get", `user:${friendId}`))
  );

  const mappedFriends = friends.map((f) => JSON.parse(f) as User);

  return mappedFriends;
};
