import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import React, { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { IPost } from "../components/TimeLine";
import Post from "../components/Post";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: ${(props) => props.theme.colors.background};
  border-radius: ${(props) => props.theme.borderRadius.large};
  box-shadow: ${(props) => props.theme.shadows.medium};
`;

const AvatarUpload = styled.label`
  width: 110px;
  height: 110px;
  background: ${(props) => props.theme.colors.primary};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  cursor: pointer;
  svg {
    width: 100px;
  }
`;

const AvatarImg = styled.img`
  height: 100%;
`;

const AvatarInput = styled.input`
  display: none;
`;

const Name = styled.span`
  font-size: 22px;
  color: ${(props) => props.theme.colors.text};
`;

const Posts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

const ChangeNameBtn = styled.span`
  background: ${(props) => props.theme.colors.text};
  color: ${(props) => props.theme.colors.white};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  padding: 6px 10px;
  cursor: pointer;
  display: inline-block;
  transition: background 0.2s ease;

  &:hover {
    background: ${(props) => props.theme.colors.primary};
  }
`;

const NameInput = styled.input`
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
  text-align: center;
  border: none;
  border-bottom: 1px solid ${(props) => props.theme.colors.text};
  padding: 8px 0;
  font-size: 18px;
  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

const Profile = () => {
  const user = auth.currentUser;
  const [profileImg, setProfileImg] = useState(
    user?.photoURL || null || undefined
  );
  const [post, setPost] = useState<IPost[]>([]);
  const [name, setName] = useState(user?.displayName ?? "Anonymous");
  const [editMode, serEditMode] = useState(false);
  const onProfileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!user) return;
    if (files && files.length === 1) {
      const file = files[0];

      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert("이미지 크기는 5MB 이하여야 합니다.");
        return;
      }

      try {
        const locationRef = ref(storage, `avatars/${user.uid}/${file.name}`);
        const result = await uploadBytes(locationRef, file);
        const avatarUrl = await getDownloadURL(result.ref);
        setProfileImg(avatarUrl);
        await updateProfile(user, {
          photoURL: avatarUrl,
        });
      } catch (error) {
        console.error("프로필 이미지 업로드 실패:", error);
        alert("프로필 이미지 업로드에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };
  const onChangeNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  const onChangeNameBtn = async () => {
    if (!user) return;
    serEditMode((prev) => !prev);
    if (!editMode) return;
    try {
      await updateProfile(user, {
        displayName: name,
      });
    } catch (e) {
      console.error(e);
    } finally {
      serEditMode(false);
    }
  };

  const fetchPosts = async () => {
    const postQuery = query(
      collection(db, "contents"),
      where("userId", "==", user?.uid),
      orderBy("createdAt", "desc"),
      limit(25)
    );
    const snapshot = await getDocs(postQuery);
    const posts = snapshot.docs.map((doc) => {
      const { createdAt, photo, video, post, userId, username, profileUrl } =
        doc.data();
      return {
        createdAt,
        photo,
        video,
        post,
        userId,
        username,
        profileUrl,
        id: doc.id,
      };
    });
    setPost(posts);
  };
  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <Wrapper>
      <AvatarUpload htmlFor="avatar">
        {profileImg ? (
          <AvatarImg src={profileImg} />
        ) : (
          <svg
            data-slot="icon"
            fill="none"
            strokeWidth={1.5}
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        )}
      </AvatarUpload>
      <AvatarInput
        id="avatar"
        type="file"
        accept="image/*"
        onChange={onProfileChange}
      />
      {editMode ? (
        <NameInput onChange={onChangeNameInput} value={name} />
      ) : (
        <Name>{user?.displayName ?? "Anonymous"}</Name>
      )}
      <ChangeNameBtn onClick={onChangeNameBtn}>
        {editMode ? "저장" : "변경"}
      </ChangeNameBtn>

      <Posts>
        {post.map((item) => (
          <Post key={item.id} {...item} />
        ))}
      </Posts>
    </Wrapper>
  );
};

export default Profile;
