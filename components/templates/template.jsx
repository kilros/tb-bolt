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
  const [pageInput, setPageInput] = useState("");

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

  const calculatePages = () => {
    const pages = [];
    let currentPage = [];
    let currentHeight = 0;
    const maxHeight = 12;
    let clauseIndex = 0;

    while (clauseIndex < content.length) {
      const clause = content[clauseIndex];
      const clauseHeight = clause.reduce((acc, node) => acc + getNodeHeight(node), 0);

      // Try to fit the entire clause
      if (currentHeight + clauseHeight <= maxHeight) {
        currentPage.push({
          content: clause,
          originalIndex: clauseIndex,
          isSplit: false
        });
        currentHeight += clauseHeight;
        clauseIndex++;
      } else {
        // Need to split the clause
        let firstPart = [];
        let secondPart = [];
        let heightAccumulator = 0;

        // First pass: collect nodes until we hit the height limit
        for (let i = 0; i < clause.length; i++) {
          const node = clause[i];
          const nodeHeight = getNodeHeight(node);

          if (heightAccumulator + nodeHeight <= maxHeight - currentHeight) {
            firstPart.push(node);
            heightAccumulator += nodeHeight;
          } else {
            // Add remaining nodes to second part
            secondPart = clause.slice(i);
            break;
          }
        }

        // Add first part to current page if we have any content
        if (firstPart.length > 0) {
          currentPage.push({
            content: firstPart,
            originalIndex: clauseIndex,
            isSplit: true,
            isFirstPart: true
          });
        }

        // Save current page if it has content
        if (currentPage.length > 0) {
          pages.push(currentPage);
        }

        // Start new page with second part
        currentPage = [];
        currentHeight = 0;

        if (secondPart.length > 0) {
          currentPage = [{
            content: secondPart,
            originalIndex: clauseIndex,
            isSplit: true,
            isFirstPart: false
          }];
          currentHeight = secondPart.reduce((acc, node) => acc + getNodeHeight(node), 0);
        }

        clauseIndex++;
      }

      // Start new page if current is full or we're at the end
      if (currentHeight >= maxHeight || (clauseIndex === content.length && currentPage.length > 0)) {
        pages.push(currentPage);
        currentPage = [];
        currentHeight = 0;
      }
    }

    return pages;
  };

  const pages = calculatePages();

  const renderPage = (clauses, pageIndex) => (
    
    <div key={pageIndex} className="contract-page">
      <div className="contract-page-content">
        {clauses.map((clauseInfo, index) => {
          const { content: clause, originalIndex } = clauseInfo;

          if (!refs.current[originalIndex]) {
            refs.current[originalIndex] = createRef();
          }

          return (
            <div
              className={`relative ${!readOnly ? "hover:border border-dashed border-black rounded-lg" : ""}`}
              onMouseOver={() => handleMouseOver(originalIndex)}
              onMouseLeave={() => handleMouseLeave(originalIndex)}
              key={`${originalIndex}_${index}`}
              ref={refs.current[originalIndex]}
            >
              <Clause
                status={status}
                content={clause}
                setContent={updateClause}
                index={originalIndex}
                setEditor={setActiveEditor}
                readOnly={readOnly}
              />
              {!readOnly && (
                <div className={`absolute top-2 right-6 flex flex-row gap-2 ${overStatus[originalIndex] ? "" : "hidden"}`}>
                  <button
                    className="px-2 py-1 bg-red-600 hover:bg-red-400 rounded text-sm"
                    onClick={() => {
                      setCurrentIndex(originalIndex);
                      setIsOpenRemove(true);
                    }}
                  >
                    Delete
                  </button>
                  <button
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-400 rounded text-sm"
                    onClick={() => {
                      setOption(0);
                      setCurrentIndex(originalIndex);
                      setIsOpenList(true);
                    }}
                  >
                    Replace
                  </button>
                  <button
                    className="px-2 py-1 bg-yellow-600 hover:bg-yellow-400 rounded text-sm"
                    onClick={() => {
                      setOption(1);
                      setCurrentIndex(originalIndex);
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
        {pageIndex === pages.length - 1 && (status === 0 || status === 10) && (
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
      <div className="absolute bottom-[0.25in] left-1/2 transform -translate-x-1/2 text-sm text-gray-600">
        {pageIndex + 1}
      </div>
    </div>
  );

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
      setPageInput("");
      window.scrollTo(0, 0);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setPageInput("");
      window.scrollTo(0, 0);
    }
  };

  const handlePageInputChange = (e) => {
    const value = e.target.value;
    setPageInput(value);

    const pageNumber = parseInt(value) - 1;
    if (pageNumber >= 0 && pageNumber < pages.length) {
      setCurrentPage(pageNumber);
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    scroll.scrollToTop({ duration: 500, smooth: true })
  }, [currentPage])

  return (
    <>
      {isLoading && (
        <div className="fixed left-0 right-0 top-[60px] md:top-[80px] bottom-[0px] md:bottom-[0px] flex justify-center items-center backdrop-blur-sm bg-white/5 z-50">
          <ReactLoading type="spinningBubbles" color="#ffb800" />
        </div>
      )}
      <div className="flex flex-col">
        {isShowToolbar && (
          <div className="sticky top-0 z-20 flex justify-center">
            <div className="w-[7.5in] border-b border-gray-700 p-2 bg-[#2a2d35]">
              <Toolbar className="flex flex-wrap justify-center gap-4" editor={activeEditor.editor} />
            </div>
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
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={pages.length}
                value={pageInput || currentPage + 1}
                onChange={handlePageInputChange}
                className="w-16 text-center rounded border border-gray-300 p-1 bg-white text-black"
              />
              <span className="text-lg font-medium">
                of {pages.length}
              </span>
            </div>
            <button
              onClick={nextPage}
              disabled={currentPage === pages.length - 1}
              className="p-2 rounded-full bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}