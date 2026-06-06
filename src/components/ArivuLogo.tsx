/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";

interface ArivuLogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function ArivuLogo({ className = "", style }: ArivuLogoProps) {
  const sources = [
    "/arivu_logo.png",
    "public/arivu_logo.png",
    "https://www.arivufoundation.org/_next/image?url=%2Fassets%2Fimages%2Fmake_a_3d_model_of_202605151251-removebg-preview-1778920681336.png&w=256&q=75"
  ];
  const [srcIndex, setSrcIndex] = useState(0);

  const handleError = () => {
    if (srcIndex < sources.length - 1) {
      setSrcIndex(srcIndex + 1);
    }
  };

  return (
    <img
      src={sources[srcIndex]}
      alt="Arivu Foundation Logo"
      className={className}
      style={style}
      onError={handleError}
    />
  );
}
