import styled from "styled-components";

export const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

export const AuthContainer = styled.div`
  padding: 50px 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 400px;
  backdrop-filter: blur(10px);
`;

export const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #2d3436;
  margin-bottom: 30px;
  text-align: center;
  span {
    color: #ff6b6b;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 15px;
  border-radius: 12px;
  border: 1.5px solid #e1e1e1;
  font-size: 16px;
  transition: all 0.2s ease;
  background-color: #f8f9fa;

  &:focus {
    outline: none;
    border-color: #ff6b6b;
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
    background-color: white;
  }

  &[type="submit"] {
    background: linear-gradient(45deg, #ff6b6b, #ff8e53);
    color: white;
    border: none;
    font-weight: 600;
    cursor: pointer;
    padding: 16px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(255, 107, 107, 0.2);
    }

    &:active {
      transform: translateY(0);
    }
  }
`;

export const Switcher = styled.div`
  margin-top: 20px;
  text-align: center;
  color: #636e72;
  font-size: 15px;
`;

export const Error = styled.span`
  color: #e74c3c;
  font-size: 14px;
  text-align: center;
  margin: 10px 0;
  display: block;
  background-color: rgba(231, 76, 60, 0.1);
  padding: 10px;
  border-radius: 8px;
`;

export const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
  color: #636e72;

  &::before,
  &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid #e1e1e1;
  }

  &::before {
    margin-right: 10px;
  }

  &::after {
    margin-left: 10px;
  }
`;
