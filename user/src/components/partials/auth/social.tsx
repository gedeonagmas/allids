
"use client";
import React from "react";
import Image from "next/image";
import { toast } from "sonner";

const Social = () => {
  const handleSocialLogin = (platform: string) => {
    toast.info(`${platform} login is currently disabled for this portal.`);
  };

  return (
    <>
      <ul className="flex gap-4 justify-center">
        <li className="">
          <button
            onClick={() => handleSocialLogin("Twitter")}
            className="inline-flex h-10 w-10 p-2 bg-[#1C9CEB] text-white text-2xl flex-col items-center justify-center rounded-full"
          >
            <Image width={24} height={24} className="w-6 h-6" src="/images/icon/tw.svg" alt="Twitter" />
          </button>
        </li>
        <li className="">
          <button
             onClick={() => handleSocialLogin("Facebook")}
            className="inline-flex h-10 w-10 p-2 bg-[#395599] text-white text-2xl flex-col items-center justify-center rounded-full"
          >
            <Image width={24} height={24} className="w-6 h-6" src="/images/icon/fb.svg" alt="Facebook" />
          </button>
        </li>
        <li className="">
          <button
             onClick={() => handleSocialLogin("LinkedIn")}
            className="inline-flex h-10 w-10 p-2 bg-[#0A63BC] text-white text-2xl flex-col items-center justify-center rounded-full"
          >
            <Image width={24} height={24} className="w-6 h-6" src="/images/icon/in.svg" alt="LinkedIn" />
          </button>
        </li>
        <li className="">
          <button
             onClick={() => handleSocialLogin("Google")}
             className="inline-flex h-10 w-10 p-2 bg-[#EA4335] text-white text-2xl flex-col items-center justify-center rounded-full">
            <Image width={24} height={24} className="w-6 h-6" src="/images/icon/gp.svg" alt="Google" />
          </button>
        </li>
      </ul>
    </>
  );
};

export default Social;
