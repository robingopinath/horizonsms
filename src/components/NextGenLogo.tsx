/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";

interface NextGenLogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function NextGenLogo({ className = "", style }: NextGenLogoProps) {
  const sources = [
    "/nextgen_logo.png",
    "public/nextgen_logo.png",
    "https://static.wixstatic.com/media/da8715_c5e4db8e81b9402eb59706f12012213b~mv2.png/v1/fill/w_159,h_73,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Nextgen%20logo_Transparentwhite%20jpg.png"
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
      alt="NextGen Gurukul"
      className={className}
      style={style}
      onError={handleError}
    />
  );
}
