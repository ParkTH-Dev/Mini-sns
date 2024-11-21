import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import { FirebaseError } from "firebase/app";
import {
  Form,
  Input,
  Title,
  Wrapper,
  Error,
  AuthContainer,
  Divider,
  Switcher,
} from "../components/auth-components";
import GithubBtn from "../components/GithubBtn";

const CreateAccount = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = e;

    if (name === "name") {
      setName(value);
    } else if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || name === "" || email === "" || password === "") return;
    try {
      setIsLoading(true);
      const credentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(credentials.user, {
        displayName: name,
      });
      navigate("/");
    } catch (e) {
      if (e instanceof FirebaseError) {
        setError(e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Wrapper>
      <AuthContainer>
        <Title>
          계정 만들기 <span>🎉</span>
        </Title>
        <Form onSubmit={onSubmit}>
          <Input
            onChange={onChange}
            name="name"
            value={name}
            type="text"
            placeholder="이름을 입력해주세요"
            required
            autoComplete="name"
          />
          <Input
            onChange={onChange}
            name="email"
            value={email}
            type="email"
            placeholder="이메일을 입력해주세요"
            required
            autoComplete="email"
          />
          <Input
            onChange={onChange}
            name="password"
            value={password}
            type="password"
            placeholder="비밀번호를 입력해주세요"
            required
            autoComplete="new-password"
          />
          <Input
            type="submit"
            value={isLoading ? "계정 생성 중..." : "계정 만들기"}
          />
        </Form>
        {error !== "" ? <Error>{error}</Error> : null}
        <Divider>또는</Divider>
        <GithubBtn />
        <Switcher>
          이미 계정이 있으신가요?{" "}
          <Link
            to="/login"
            style={{
              color: "#FF6B6B",
              textDecoration: "none",
              fontWeight: "600",
              marginLeft: "8px",
            }}
          >
            로그인하기 &rarr;
          </Link>
        </Switcher>
      </AuthContainer>
    </Wrapper>
  );
};

export default CreateAccount;
