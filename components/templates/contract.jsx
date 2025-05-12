"use client"
import { useRef, useState } from "react";
import ReactLoading from "react-loading";
import { ChevronDown } from "lucide-react";
import { template2 } from "../../utils/constants";
import Template from "./template";
import ScrollBtn from "@/components/base/scrollBtn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { animateScroll as scroll } from 'react-scroll';

export default function Contract({
  isCreate = false,
  docId = 0,
  isShare = false,
  bottom = 24,
  cancel = () => { },
}) {
  const [content, setContent] = useState(template2);
  const container = useRef(null);
  const clauseRefs = useRef({});

  const scrollToClause = (index) => {
    if (clauseRefs.current[index] && clauseRefs.current[index].current) {
      clauseRefs.current[index].current.scrollIntoView({ 
        behavior: "smooth",
        block: "start"
      });
    }
  };

  const getClauseTitles = () => {
    return content.map((clause) => {
      const titleBlock = clause[0];
      if (titleBlock.type === "heading-two") {
        return titleBlock.children[0].text;
      }
      return null;
    }).filter(Boolean);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        <div className="w-full bg-[#2a2d35] rounded-lg p-6">
          <div className="sticky top-0 z-20 mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span>Jump to Clause</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full" align="start">
                {getClauseTitles().map((title, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => scrollToClause(index)}
                    className="cursor-pointer"
                  >
                    {title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="mt-2" ref={container}>
            <Template 
              status={10} 
              content={content} 
              setContent={setContent} 
              isShowToolbar={isCreate} 
              readOnly={isCreate ? false : true}
              clauseRefs={clauseRefs}
            />
          </div>
        </div>
      </div>
      <ScrollBtn bottom={bottom} />
    </>
  );
}