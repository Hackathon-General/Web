"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface FeedPost {
  id: string;
  authorId: string;
  authorName?: string;
  authorPhoto?: string;
  stationId?: string;
  value?: string;
  text?: string;
  imageUrl?: string;
  createdAt?: any;
}

/** Live community feed (bounded query). */
export function useFeed(max = 100) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "feed"),
      orderBy("createdAt", "desc"),
      limit(max)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setPosts(
          snap.docs.map(
            (d) => ({ id: d.id, ...(d.data() as object) }) as FeedPost
          )
        );
        setLoading(false);
      },
      (err) => {
        console.error("useFeed query failed:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [max]);

  return { posts, loading };
}

/** Delete a feed post (admin moderation). */
export async function deleteFeedPost(postId: string) {
  await deleteDoc(doc(db, "feed", postId));
}
