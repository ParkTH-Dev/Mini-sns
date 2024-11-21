import PostForm from "../components/PostForm";
import styled from "styled-components";
import TimeLine from "../components/TimeLine";

const Wrapper = styled.div`
  /* height: 100vh; */
  display: flex;
  flex-direction: column;
  gap: 30px;

  overflow-y: scroll;
  scrollbar-width: none;
`;

const Home = () => {
  return (
    <Wrapper>
      <PostForm />
      <TimeLine />
    </Wrapper>
  );
};

export default Home;
