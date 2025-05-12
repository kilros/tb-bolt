"use client"
import { createRef, useEffect, useRef, useState } from "react";
import { Toolbar } from "./components";
import { template2 } from "../../utils/constants";
import Clause from "./clause.jsx";
import { createEditor, Editor } from "slate";
import { animateScroll as scroll } from 'react-scroll';

export default function Template({
  status = 10,
  content = template2,
  setContent = () => { },
  isShowToolbar = true,
  readOnly = false,
  tempRef = null,
  clauseRefs = null,
}) {
  const refs = useRef({});
  const isFirstLoad = useRef(true);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [option, setOption] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeEditor, setActiveEditor] = useState({ editor: createEditor() });
  const [overStatus, setOverStatus] = useState({});

  const handleMouseOver = (idx) => {
    setOverStatus((prev) => ({
      ...prev,
      [idx]: true,
    }));
  }

  const handleMouseLeave = (idx) => {
    setOverStatus((prev) => ({
      ...prev,
      [idx]: false,
    }));
  }

  const updateClause = (index, data) => {
    setContent((prevData) =>
      prevData.map((item, idx) =>
        idx === index
          ? data
          : item
      )
    );
  }

  useEffect(() => {
    if (refs.current[currentIndex]?.current) {
      refs.current[currentIndex].current.scrollIntoView({
        behavior: "instant",
        block: "center",
      });
    }
  }, [content.length])

  useEffect(() => {
    if (activeEditor.editor && status == 0) {
      Editor.addMark(activeEditor.editor, "highlight", true);
    }
  }, [activeEditor]);

  useEffect(() => {
    if (content.length > 0 && isFirstLoad.current) {
      scroll.scrollToTop({ duration: 500, smooth: true });
      isFirstLoad.current = false;
    }
  }, [content.length]);

  return (
    <>
      {isLoading && (
        <div className="fixed left-0 right-0 top-[60px] md:top-[80px] bottom-[0px] md:bottom-[0px] flex justify-center items-center backdrop-blur-sm bg-white/5 z-50">
          <ReactLoading type="spinningBubbles" color="#ffb800" />
        </div>
      )}
      <div className="flex flex-col gap-4">
        {isShowToolbar && (
          <div className="sticky top-0 z-20">
            <Toolbar className="flex flex-wrap border-b border-gray-700 gap-4 p-2 bg-[#2a2d35]" editor={activeEditor.editor} />
          </div>
        )}
        <div className="flex flex-col pt-12 pb-6 px-2 bg-white">
          <div ref={tempRef}>
            {content && content.map((clause, index) => {
              if (clauseRefs) {
                clauseRefs.current[index] = createRef();
              }
              return (
                <div 
                  className={`relative ${!readOnly ? "hover:border border-dashed border-black rounded-lg" : ""}`} 
                  onMouseOver={() => handleMouseOver(index)} 
                  onMouseLeave={() => handleMouseLeave(index)} 
                  key={content.length + "_" + index} 
                  ref={clauseRefs ? clauseRefs.current[index] : null}
                >
                  <Clause status={status} content={clause} setContent={updateClause} index={index} setEditor={setActiveEditor} readOnly={readOnly} />
                  {!readOnly && (
                    <div className={`absolute top-2 right-6 flex flex-row gap-2 ${overStatus[index] ? "" : "hidden"}`}>
                      <button className="px-2 py-1 bg-red-600 hover:bg-red-400 rounded text-sm" onClick={() => {
                        setCurrentIndex(index); setIsOpenRemove(true);
                      }}>Delete</button>
                      <button className="px-2 py-1 bg-blue-600 hover:bg-blue-400 rounded text-sm" onClick={() => { setOption(0); setCurrentIndex(index); setIsOpenList(true) }}>Replace</button>
                      <button className="px-2 py-1 bg-yellow-600 hover:bg-yellow-400 rounded text-sm" onClick={() => { setOption(1); setCurrentIndex(index); setIsOpenList(true) }}>Insert</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {
            (status == 0 || status == 10) && (
              <div className="flex items-center justify-center mt-8">
                <button className="px-4 py-2 bg-blue-700 hover:bg-blue-500 text-white rounded" onClick={() => { setOption(2); setIsOpenList(true) }}>Add New Clause</button>
              </div>
            )
          }
        </div>
      </div>
    </>
  );
}