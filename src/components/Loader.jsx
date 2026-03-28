import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="loader">
        <div className="book">
          <div className="page" />
          <div className="page page2" />
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /* FULL SCREEN OVERLAY STYLES */
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;

  .loader {
    width: fit-content;
    height: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
    --book-color: #32CD32;
    --book-cover-color: #506c86;
  }
  .book {
    width: 150px;
    height: 13px;
    background-color: var(--book-color);
    border-bottom: 2px solid var(--book-cover-color);
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    position: relative;
  }
  .page {
    width: 50%;
    height: 2px;
    background-color: var(--book-color);
    animation: paging 0.7s ease-out infinite;
    transform-origin: left;
  }
  .page2 {
    width: 50%;
    height: 2px;
    background-color: var(--book-color);
    animation: paging 0.8s ease-out infinite;
    transform-origin: left;
    position: absolute;
  }
  @keyframes paging {
    10% {
      transform: rotateZ(0deg);
    }
    100% {
      transform: rotateZ(-180deg);
    }
  }
`;

export default Loader;