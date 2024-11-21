import {
  GithubAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { auth } from "../firebase";

const Button = styled.span`
  width: 100%;
  background: #fff;
  color: #000;
  font-weight: 600;
  margin-top: 20px;
  padding: 10px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  border-radius: 50px;
  cursor: pointer;
`;

const Logo = styled.img`
  height: 25px;
`;

const GithubBtn = () => {
  const navigate = useNavigate();
  const onClick = async () => {
    try {
      const provider = new GithubAuthProvider();

      // 먼저 GitHub로 로그인 시도
      await signInWithPopup(auth, provider).catch(async (error) => {
        if (error.code === "auth/account-exists-with-different-credential") {
          // 기존 계정의 이메일 가져오기
          const email = error.customData.email;
          // 이 이메일로 가입된 제공업체 확인
          const providers = await fetchSignInMethodsForEmail(auth, email);

          alert(
            `이미 ${providers[0]}로 가입된 이메일입니다. ${providers[0]} 로그인을 이용해주세요.`
          );
        } else {
          console.error("GitHub 로그인 에러:", error.code, error.message);
        }
        throw error;
      });

      navigate("/");
    } catch (e) {
      console.error("로그인 실패:", e);
    }
  };
  return (
    <Button onClick={onClick}>
      <Logo src="/github-mark.svg" />
      Continue With GitHub
    </Button>
  );
};

export default GithubBtn;
