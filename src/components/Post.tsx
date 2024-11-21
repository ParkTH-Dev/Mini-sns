import styled from "styled-components";
import { IPost } from "./TimeLine";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  StorageError,
  StorageErrorCode,
  uploadBytes,
  uploadBytesResumable,
  ref,
} from "firebase/storage";
import { useState } from "react";
import { GrUpdate } from "react-icons/gr";

const Wrapper = styled.div`
  background: ${(props) => props.theme.colors.white};
  border-radius: ${(props) => props.theme.borderRadius.large};
  box-shadow: ${(props) => props.theme.shadows.medium};
  padding: 25px;
  margin-bottom: 20px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${(props) => props.theme.shadows.large};
  }
  .content {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
`;

const Item = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ContentWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;

  .text-content {
    flex: 1;
  }
`;

const UserName = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.text};
`;

const PostImg = styled.img`
  width: 100%;
  height: 100%;
  border-radius: ${(props) => props.theme.borderRadius.medium};
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  border-radius: ${(props) => props.theme.borderRadius.medium};
`;

const EditorColumns = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  justify-content: flex-end;

  .update-delete-btns {
    display: flex;
    gap: 8px;
    align-items: center;
  }
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border-radius: ${(props) => props.theme.borderRadius.small};
  border: 1px solid ${(props) => props.theme.colors.border};
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  transition: all 0.2s ease;
  color: ${(props) => props.theme.colors.text};

  &:hover {
    background: ${(props) => props.theme.colors.background};
  }

  &.delete {
    color: ${(props) => props.theme.colors.error};
    &:hover {
      background: ${(props) => props.theme.colors.error}10;
    }
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const SetContentBtn = styled.label`
  width: 24px;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    color: ${(props) => props.theme.colors.primary};
  }
`;

const SetContentInputBtn = styled.input`
  display: none;
`;

const PostText = styled.span`
  font-size: 16px;
  line-height: 1.5;
  color: ${(props) => props.theme.colors.text};
  margin: 5px 0;
`;

const EditPostFormTextArea = styled.textarea`
  width: 100%;
  padding: 15px;
  border-radius: ${(props) => props.theme.borderRadius.medium};
  border: 1.5px solid ${(props) => props.theme.colors.border};
  background-color: ${(props) => props.theme.colors.background};
  resize: none;
  font-size: 16px;
  margin: 5px 0;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

const DefaultAvatar = styled.svg`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${(props) => props.theme.colors.primary};
  padding: 5px;
  color: white;
`;

const Post = ({
  createdAt,
  photo,
  username,
  post,
  video,
  userId,
  id,
  profileUrl,
}: IPost) => {
  const [isEditing, setEditing] = useState(false);
  const [editedPost, setEditedPost] = useState(post);
  const [editedPhoto, setEditedPhoto] = useState<File | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedPost(e.target.value);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleEdit = async () => {
    setEditing(true);
  };

  const date = new Date(createdAt).toLocaleString();
  const user = auth.currentUser;

  const onDelete = async () => {
    const ok = confirm("정말 삭제하시겠습니까?");
    if (!ok || user?.uid !== userId) return;
    try {
      await deleteDoc(doc(db, `contents`, id));
      if (photo) {
        const photoRef = ref(storage, `contents/${user.uid}/${id}`);
        await deleteObject(photoRef);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onUpdate = async () => {
    try {
      if (user?.uid !== userId) return;

      const postDoc = await getDoc(doc(db, "contents", id));
      if (!postDoc.exists()) throw new Error("Documents does not exist");

      const postData = postDoc.data();

      if (postData) {
        if (postData.photo) postData.fileType = "image";
        if (postData.video) postData.fileType = "video";
      }

      const existingFileType = postData?.fileType || null;
      if (editedPhoto) {
        const newFileType = editedPhoto.type.startsWith("image/")
          ? "image"
          : "video";
        if (existingFileType && existingFileType !== newFileType) {
          alert("같은 유형의 콘텐만 업로드할 수 있습니다.");
          return;
        }
        const locationRef = ref(storage, `contents/${user.uid}/${id}`);
        const uploadTask = uploadBytesResumable(locationRef, editedPhoto);
        if (editedPhoto.size >= 5 * 1024 * 1024) {
          uploadTask.cancel();
          throw new StorageError(
            StorageErrorCode.CANCELED,
            "업로드 가능 최대 용량은 5MB입니다."
          );
        }
        const result = await uploadBytes(locationRef, editedPhoto);
        const url = await getDownloadURL(result.ref);
        await updateDoc(doc(db, "contents", id), {
          post: editedPost,
          photo: newFileType === "image" ? url : "",
          video: newFileType === "video" ? url : "",
          fileType: newFileType,
        });
      } else {
        await updateDoc(doc(db, "contents", id), { post: editedPost });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEditing(false);
    }
  };

  const onClickSetContent = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length === 1) setEditedPhoto(files[0]);
  };

  return (
    <Wrapper>
      <Item>
        <div className="content">
          <UserProfile>
            {profileUrl ? (
              <ProfileImage src={profileUrl} />
            ) : (
              <DefaultAvatar
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
              </DefaultAvatar>
            )}
            <UserName>{username}</UserName>
          </UserProfile>
          {photo ? <PostImg src={photo} alt="Post content" /> : null}
          {video ? <Video autoPlay muted controls src={video} /> : null}
          <ContentWrapper>
            <div className="text-content">
              {isEditing ? (
                <EditPostFormTextArea
                  placeholder={post}
                  onChange={onChange}
                  value={editedPost}
                />
              ) : (
                <PostText>{post}</PostText>
              )}
            </div>
            <EditorColumns>
              {user?.uid === userId ? (
                <div className="update-delete-btns">
                  {isEditing ? (
                    <>
                      <ActionButton onClick={handleCancel}>취소</ActionButton>
                      <ActionButton onClick={onUpdate}>수정완료</ActionButton>
                      <SetContentBtn htmlFor="edit-content">
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
                            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                          />
                        </svg>
                      </SetContentBtn>
                      <SetContentInputBtn
                        id="edit-content"
                        type="file"
                        accept="video/*, image/*"
                        onChange={onClickSetContent}
                      />
                    </>
                  ) : (
                    <ActionButton onClick={handleEdit}>
                      <GrUpdate /> 수정
                    </ActionButton>
                  )}
                  <ActionButton className="delete" onClick={onDelete}>
                    삭제
                  </ActionButton>
                </div>
              ) : null}
            </EditorColumns>
          </ContentWrapper>
          <span>{date}</span>
        </div>
      </Item>
    </Wrapper>
  );
};

export default Post;
