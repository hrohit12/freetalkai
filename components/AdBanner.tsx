"use client";

import { useEffect, useRef } from "react";

export const AdBanner = () => {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bannerRef.current && !bannerRef.current.firstChild) {
      const conf = document.createElement("script");
      const script = document.createElement("script");
      conf.innerHTML = `
        atOptions = {
          'key' : '0ac8e969353e505a7c7b924a5e81c61e',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };
      `;
      script.src = "https://www.highperformanceformat.com/0ac8e969353e505a7c7b924a5e81c61e/invoke.js";
      bannerRef.current.appendChild(conf);
      bannerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="flex justify-center py-2 bg-white/50 border-b">
      <div ref={bannerRef} />
    </div>
  );
};
