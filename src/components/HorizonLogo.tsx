/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

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

  return (
    <div className="flex flex-col items-center justify-center select-none text-center">
      <img
        src="/horizon_logo.png"
        alt="Horizon Brand Logo"
        style={{
          width: widthVal,
          height: "auto",
        }}
        className="drop-shadow-sm transition-all duration-300 hover:scale-[1.03] select-none"
      />
    </div>
  );
}
