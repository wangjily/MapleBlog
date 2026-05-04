import React from "react";

interface VideoProps {
  src: string;
  poster?: string;
  title?: string;
  loop?: boolean;
  muted?: boolean;
  autoplay?: boolean;
  controls?: boolean;
  width?: number | string;
  height?: number | string;
  className?: string;
}

const Video = ({
  src,
  poster,
  title = "视频播放",
  loop = false,
  muted = false,
  autoplay = false,
  controls = true,
  width,
  height,
  className = "",
}: VideoProps) => {
  return (
    <div className={`video-container ${className}`} style={{ maxWidth: "100%" }}>
      <video
        src={src}
        poster={poster}
        loop={loop}
        muted={muted}
        autoPlay={autoplay}
        controls={controls}
        width={width}
        height={height}
        style={{
          width: "100%",
          maxWidth: width ? (typeof width === "number" ? `${width}px` : width) : "100%",
          borderRadius: "8px",
          backgroundColor: "#000",
        }}
        title={title}
        playsInline
      >
        您的浏览器不支持视频播放。
        <source src={src} type={`video/${src.split(".").pop()}`} />
      </video>
    </div>
  );
};

export default Video;
