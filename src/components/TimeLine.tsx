import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Unsubscribe,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { db } from "../firebase";
import Post from "./Post";

export interface IPost {
  createdAt: string;
  photo?: string;
  video?: string;
  post: string;
  userId: string;
  username: string;
  id: string;
  profileUrl?: string;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  padding: 20px;
  max-height: 80vh;
  background: ${(props) => props.theme.colors.background};
  border-radius: ${(props) => props.theme.borderRadius.large};
  box-shadow: ${(props) => props.theme.shadows.medium};
`;

const TimeLine = () => {
  const [post, setPost] = useState<IPost[]>([]);

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;
    const fetchPost = async () => {
      const postQuery = query(
        collection(db, "contents"),
        orderBy("createdAt", "desc")
      );
      unsubscribe = await onSnapshot(postQuery, (snapshot) => {
        const posts = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
          } as IPost;
        });
        setPost(posts);
      });
    };
    fetchPost();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);
  return (
    <Wrapper>
      {post.map((item) => (
        <Post key={item.id} {...item} />
      ))}
    </Wrapper>
  );
};

export default TimeLine;
