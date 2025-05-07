"use client"
import { useRef, useState } from "react";
import ReactLoading from "react-loading";

import {template2 } from "../../utils/constants";

import Template from "./template";
import ScrollBtn from "@/components/base/scrollBtn";

export default function Contract({
  isCreate = false,
  docId = 0,
  isShare = false,
  bottom = 24,
  cancel = () => { },
}) {

  const [content, setContent] = useState(template2);
  const container = useRef(null);

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        <div className="w-full bg-[#2a2d35] rounded-lg p-6">
          <div className="mt-2" ref={container} >
            <Template status={10} content={content} setContent={setContent} isShowToolbar={isCreate} readOnly={
              isCreate ? false : true
            } />
          </div>
        </div>
      </div >
      <ScrollBtn bottom={bottom} />
    </>
  );
}