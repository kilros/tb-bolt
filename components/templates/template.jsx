"use client"
import ReactLoading from "react-loading";
import { createRef, useEffect, useRef, useState } from "react";
import { Toolbar } from "./components";
import { template2 } from "../../utils/constants";
import Clause from "./clause.jsx";
import { createEditor, Editor } from "slate";
import { animateScroll as scroll } from 'react-scroll';
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Template({
  status = 10,
  content = template2,
  setContent = () => { },
  isShowToolbar = true,
  readOnly = false,
  tempRef = null,
}) {
  const refs = useRef({});
  const isFirstLoad = useRef(true);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [option, setOption] = useState(0);  //0:replace 1:insert 2:add
  const [isLoading, setIsLoading] = useState(false);
  const [activeEditor, setActiveEditor] = useState({ editor: createEditor() });
  const [overStatus, setOverStatus] = useState({});
  const [isOpenList, setIsOpenList] = useState(false);
  const [isOpenRemove, setIsOpenRemove] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const handleMouseOver = (idx) => {
    setOverStatus((prev) => ({
      ...prev,
      [idx]: true,
    }));
  };

  const handleMouseLeave = (idx) => {
    setOverStatus((prev) => ({
      ...prev,
      [idx]: false,
    }));
  };

  const updateClause = (index, data) => {
    setContent((prevData) =>
      prevData.map((item, idx) =>
        idx === index
          ? data
          : item
      )
    );
  };

  useEffect(() => {
    if (refs.current[currentIndex]?.current) {
      refs.current[currentIndex].current.scrollIntoView({
        behavior: "instant",
        block: "center",
      });
    }
  }, [content.length]);

  useEffect(() => {
    if (activeEditor.editor && status === 0) {
      Editor.addMark(activeEditor.editor, "highlight", true);
    }
  }, [activeEditor, status]);

  useEffect(() => {
    if (content.length > 0 && isFirstLoad.current) {
      scroll.scrollToTop({ duration: 500, smooth: true });
      isFirstLoad.current = false;
    }
  }, [content.length]);

  const getNodeHeight = (node) => {
    if (!node.children || node.children.length === 0) return 0;

    const text = typeof node.children[0] === 'string' 
      ? node.children[0] 
      : node.children[0].text || '';
    
    const charsPerLine = 100;
    const baseHeight = 0.3;
    const lines = Math.ceil(text.length / charsPerLine);

    switch (node.type) {
      case 'heading-one':
        return Math.max(1, lines * 0.5) + 0.5;
      case 'heading-two':
        return Math.max(0.8, lines * 0.4) + 0.3;
      case 'numbered-list':
      case 'bulleted-list':
        return node.children.reduce((acc, child) => 
          acc + getNodeHeight(child), 0);
      case 'list-item':
        return Math.max(0.4, lines * 0.3);
      case 'block-quote':
        return Math.max(0.6, lines * 0.35);
      default:
        return Math.max(baseHeight, lines * 0.25);
    }
  };

  const splitClause = (clause, remainingHeight) => {
    let firstPart = [];
    let secondPart = [];
    let currentHeight = 0;

    for (let node of clause) {
      const nodeHeight = getNodeHeight(node);
      
      if (currentHeight + nodeHeight <= remainingHeight) {
        firstPart.push(node);
        currentHeight += nodeHeight;
      } else {
        // If the node is a list, try to split it
        if (node.type === 'numbered-list' || node.type === 'bulleted-list') {
          const { first, second } = splitList(node, remainingHeight - currentHeight);
          if (first.children.length > 0) firstPart.push(first);
          if (second.children.length > 0) secondPart.push(second);
        } else {
          secondPart.push(node);
        }
      }
    }

    return { firstPart, secondPart };
  };

  const splitList = (list, remainingHeight) => {
    const first = { ...list, children: [] };
    const second = { ...list, children: [] };
    let currentHeight = 0;

    for (let item of list.children) {
      const itemHeight = getNodeHeight(item);
      if (currentHeight + itemHeight <= remainingHeight) {
        first.children.push(item);
        currentHeight += itemHeight;
      } else {
        second.children.push(item);
      }
    }

    return { first, second };
  };

  const calculatePages = () => {
    const pages = [];
    let currentPage = [];
    let currentHeight = 0;
    const maxHeight = 12;
    let processedContent = [];
    let currentClauseIndex = 0;

    while (currentClauseIndex < content.length) {
      const clause = content[currentClauseIndex];
      const clauseHeight = clause.reduce((acc, node) => acc + getNodeHeight(node), 0);

      if (currentHeight + clauseHeight <= maxHeight) {
        currentPage.push(clause);
        processedContent.push(clause);
        currentHeight += clauseHeight;
        currentClauseIndex++;
      } else {
        // Split the clause if it doesn't fit
        const { firstPart, secondPart } = splitClause(clause, maxHeight - currentHeight);
        
        if (firstPart.length > 0) {
          currentPage.push(firstPart);
          processedContent.push(firstPart);
        }
        
        if (secondPart.length > 0) {
          pages.push([...currentPage]);
          currentPage = [secondPart];
          processedContent.push(secondPart);
          currentHeight = secondPart.reduce((acc, node) => acc + getNodeHeight(node), 0);
        }
        
        currentClauseIndex++;
      }

      // Start new page if current page is full
      if (currentHeight >= maxHeight || currentClauseIndex === content.length) {
        if (currentPage.length > 0) {
          pages.push([...currentPage]);
          currentPage = [];
          currentHeight = 0;
        }
      }
    }

    return { pages, processedContent };
  };

  const { pages, processedContent } = calculatePages();

  const renderPage = (clauses, pageIndex) => (
    <div key={pageIndex} className="contract-page">
      <div className="contract-page-content">
        {clauses.map((clause, index) => {
          const globalIndex = processedContent.findIndex(c => 
            JSON.stringify(c) === JSON.stringify(clause)
          );
          
          if (!refs.current[globalIndex]) {
            refs.current[globalIndex] = createRef();
          }

          return (
            <div 
              className={`relative ${!readOnly ? "hover:border border-dashed border-black rounded-lg" : ""}`} 
              onMouseOver={() => handleMouseOver(globalIndex)} 
              onMouseLeave={() => handleMouseLeave(globalIndex)} 
              key={`${processedContent.length}_${globalIndex}`}
              ref={refs.current[globalIndex]}
            >
              <Clause 
                status={status} 
                content={clause} 
                setContent={updateClause} 
                index={globalIndex} 
                setEditor={setActiveEditor} 
                readOnly={readOnly} 
              />
              {!readOnly && (
                <div className={`absolute top-2 right-6 flex flex-row gap-2 ${overStatus[globalIndex] ? "" : "hidden"}`}>
                  <button 
                    className="px-2 py-1 bg-red-600 hover:bg-red-400 rounded text-sm" 
                    onClick={() => {
                      setCurrentIndex(globalIndex); 
                      setIsOpenRemove(true);
                    }}
                  >
                    Delete
                  </button>
                  <button 
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-400 rounded text-sm" 
                    onClick={() => { 
                      setOption(0); 
                      setCurrentIndex(globalIndex); 
                      setIsOpenList(true);
                    }}
                  >
                    Replace
                  </button>
                  <button 
                    className="px-2 py-1 bg-yellow-600 hover:bg-yellow-400 rounded text-sm" 
                    onClick={() => { 
                      setOption(1); 
                      setCurrentIndex(globalIndex); 
                      setIsOpenList(true);
                    }}
                  >
                    Insert
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <>
      {isLoading && (
        <div className="fixed left-0 right-0 top-[60px] md:top-[80px] bottom-[0px] md:bottom-[0px] flex justify-center items-center backdrop-blur-sm bg-white/5 z-50">
          <ReactLoading type="spinningBubbles" color="#ffb800" />
        </div>
      )}
      <div className="flex flex-col">
        {isShowToolbar && (
          <div className="sticky top-0 z-20">
            <Toolbar className="flex flex-wrap border-b border-gray-700 gap-4 p-2 bg-[#2a2d35]" editor={activeEditor.editor} />
          </div>
        )}
        <div className="flex flex-col items-center" ref={tempRef}>
          {renderPage(pages[currentPage], currentPage)}
          <div className="flex items-center justify-center gap-4 mt-4 mb-8">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className="p-2 rounded-full bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <span className="text-lg font-medium">
              Page {currentPage + 1} of {pages.length}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === pages.length - 1}
              className="p-2 rounded-full bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
        {(status === 0 || status === 10) && (
          <div className="flex items-center justify-center mt-8">
            <button 
              className="px-4 py-2 bg-blue-700 hover:bg-blue-500 text-white rounded" 
              onClick={() => { 
                setOption(2); 
                setIsOpenList(true);
              }}
            >
              Add New Clause
            </button>
          </div>
        )}
      </div>
    </>
  );
}