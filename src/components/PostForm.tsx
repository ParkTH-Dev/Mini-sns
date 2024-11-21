import { addDoc, collection } from "firebase/firestore";
import React, { useState } from "react";
import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const Form = styled.form`
  background: ${(props) => props.theme.colors.white};
  padding: 25px;
  border-radius: ${(props) => props.theme.borderRadius.large};
  box-shadow: ${(props) => props.theme.shadows.medium};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 15px;
  border-radius: ${(props) => props.theme.borderRadius.medium};
  border: 1.5px solid ${(props) => props.theme.colors.border};
  background-color: ${(props) => props.theme.colors.background};
  font-size: 16px;
  resize: none;
  min-height: 150px;
  transition: all 0.2s ease;
  margin-bottom: 10px;
  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: ${(props) => props.theme.borderRadius.medium};
  border: none;
  background: linear-gradient(
    45deg,
    ${(props) => props.theme.colors.primary},
    ${(props) => props.theme.colors.secondary}
  );
  color: white;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${(props) => props.theme.shadows.small};
  }
`;

const AttachFileButton = styled.label<{ $hasFile: boolean }>`
  padding: 12px;
  width: 100%;
  background: ${(props) =>
    props.$hasFile ? "linear-gradient(45deg, #4a9eff, #6eb6ff)" : "#f1f1f1"};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  border: none;
  color: ${(props) => (props.$hasFile ? "white" : "#666")};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-bottom: 10px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${(props) => props.theme.shadows.small};
  }
`;

const AttachFileInput = styled.input`
  display: none;
`;

interface PostDocument {
  post: string;
  createdAt: number;
  username: string;
  userId: string;
  profileUrl: string | null;
  photo?: string;
  video?: string;
}

const PostForm = () => {
  const [isLoading, setLoading] = useState(false);
  const [post, setPost] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPost(e.target.value);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || isLoading || post === "" || post.length > 180) return;

    try {
      setLoading(true);
      const docRef = collection(db, "contents");

      const document: PostDocument = {
        post,
        createdAt: Date.now(),
        username: user.displayName || "Anonymous",
        userId: user.uid,
        profileUrl: user.photoURL,
      };

      if (file) {
        const locationRef = ref(storage, `posts/${user.uid}/${file.name}`);
        const result = await uploadBytes(locationRef, file);
        const url = await getDownloadURL(result.ref);

        if (file.type.includes("image")) {
          document.photo = url;
        } else if (file.type.includes("video")) {
          document.video = url;
        }
      }

      await addDoc(docRef, document);
      setPost("");
      setFile(null);
      setSelectedFile(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      <TextArea
        onChange={onChange}
        value={post}
        name="contents"
        id="contents"
        placeholder="What is Happening"
        required
      ></TextArea>
      <AttachFileButton $hasFile={!!selectedFile}>
        <AttachFileInput
          type="file"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setSelectedFile(e.target.files[0]);
              setFile(e.target.files[0]);
            }
          }}
        />
        {selectedFile ? "파일 선택됨" : "파일 첨부하기"}
      </AttachFileButton>
      <Button type="submit">{isLoading ? "Posting..." : "Post"}</Button>
    </Form>
  );
};

export default PostForm;
