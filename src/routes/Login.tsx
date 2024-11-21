import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { FirebaseError } from "firebase/app";
import {
  Form,
  Input,
  Switcher,
  Title,
  Wrapper,
  Error,
  AuthContainer,
  Divider,
} from "../components/auth-components";
import GithubBtn from "../components/GithubBtn";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = e;

    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || email === "" || password === "") return;
    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
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
          Welcome Back! <span>✨</span>
        </Title>
        <Form onSubmit={onSubmit}>
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
            autoComplete="current-password"
          />
          <Input type="submit" value={isLoading ? "로그인 중..." : "로그인"} />
        </Form>
        {error !== "" ? <Error>{error}</Error> : null}
        <Divider>또는</Divider>
        <GithubBtn />
        <Switcher>
          아직 계정이 없으신가요?{" "}
          <Link
            to="/create-account"
            style={{
              color: "#FF6B6B",
              textDecoration: "none",
              fontWeight: "600",
              marginLeft: "8px",
            }}
          >
            회원가입하기 &rarr;
          </Link>
        </Switcher>
      </AuthContainer>
    </Wrapper>
  );
};

export default Login;
