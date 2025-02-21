import Image from "next/image";

const Loading = () => {
  return (
    <div
      id="loading"
      className="flex flex-col items-center justify-center w-screen h-screen pattern"
    >
      <Image
        width={1920}
        height={1080}
        alt="Logo"
        src="/logo/logo.svg"
        className="md:w-40 w-36"
        priority
        placeholder="empty"
      />
      <span className="mt-4 font-semibold text-2xl md:text-3xl text-gray-800 flex items-center">
        Loading
        <span className="dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </span>
      <style jsx>{`
        .dots span {
          animation: blink 1.5s infinite;
          font-size: 2.5rem; /* حجم النقاط */
          margin-left: 2px;
        }
        .dots span:nth-child(1) {
          animation-delay: 0s;
        }
        .dots span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .dots span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes blink {
          0%,
          20% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Loading;
