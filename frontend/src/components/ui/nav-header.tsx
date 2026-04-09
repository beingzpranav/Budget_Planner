"use client"; 

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Home, Tag, Info, Briefcase, Mail } from "lucide-react";

function NavHeader() {
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  return (
    <ul
      className="relative mx-auto flex w-fit rounded-full border-2 border-black bg-white p-1"
      onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
    >
      <Tab setPosition={setPosition}>
        <Home className="mr-2 inline-block h-4 w-4" /> Home
      </Tab>
      <Tab setPosition={setPosition}>
        <Tag className="mr-2 inline-block h-4 w-4" /> Pricing
      </Tab>
      <Tab setPosition={setPosition}>
        <Info className="mr-2 inline-block h-4 w-4" /> About
      </Tab>
      <Tab setPosition={setPosition}>
        <Briefcase className="mr-2 inline-block h-4 w-4" /> Services
      </Tab>
      <Tab setPosition={setPosition}>
        <Mail className="mr-2 inline-block h-4 w-4" /> Contact
      </Tab>

      <Cursor position={position} />
    </ul>
  );
}

const Tab = ({
  children,
  setPosition,
}: {
  children: React.ReactNode;
  setPosition: any;
}) => {
  const ref = useRef<HTMLLIElement>(null);
  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;

        const { width } = ref.current.getBoundingClientRect();
        setPosition({
          width,
          opacity: 1,
          left: ref.current.offsetLeft,
        });
      }}
      className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs uppercase text-white mix-blend-difference md:px-5 md:py-3 md:text-base"
    >
      {children}
    </li>
  );
};

const Cursor = ({ position }: { position: any }) => {
  return (
    <motion.li
      animate={position}
      className="absolute z-0 h-7 rounded-full bg-black md:h-12"
    />
  );
};

export default NavHeader;
