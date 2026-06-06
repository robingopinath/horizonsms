/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";

interface HorizonLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export default function HorizonLogo({ size = "md", showText = false }: HorizonLogoProps) {
  // Sizing definitions
  const dimensions = {
    sm: "36px",
    md: "72px",
    lg: "120px",
    xl: "200px",
  };

  const widthVal = dimensions[size];

  // Cascading fallbacks for elite compatibility across routes & networks
  const sources = [
    "https://lh3.googleusercontent.com/d/1RiPQ2zj7knFzaI19enFIE7NZNYnUrUCn",
    "https://drive.google.com/uc?export=view&id=1RiPQ2zj7knFzaI19enFIE7NZNYnUrUCn",
    "https://docs.google.com/uc?export=download&id=1RiPQ2zj7knFzaI19enFIE7NZNYnUrUCn",
    "/horizon_logo.png",
    "public/horizon_logo.png"
  ];
  const [srcIndex, setSrcIndex] = useState(0);

  const handleError = () => {
    if (srcIndex < sources.length - 1) {
      setSrcIndex(srcIndex + 1);
    }
  };

  return (
    <div className="flex items-center gap-2.5 justify-center select-none">
      <img
        src={sources[srcIndex]}
        alt="Horizon International Play School"
        style={{
          width: widthVal,
          height: "auto",
        }}
        onError={handleError}
        className="drop-shadow-sm transition-all duration-300 hover:scale-[1.03] select-none"
      />
      {showText && (
        <div className="text-left font-sans leading-none flex flex-col justify-center">
          <span className="text-sm font-black tracking-tight text-slate-900 uppercase">
            Horizon
          </span>
          <span className="text-[9.5px] font-black tracking-[0.14em] text-indigo-650 uppercase mt-0.5">
            International
          </span>
        </div>
      )}
    </div>
  );
}
