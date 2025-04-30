"use client"
import { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import { useAccount, useConfig } from "wagmi";
import { Search, ChevronDown, Plus, FileText, Puzzle, FilePlus, FileCheck, Sparkles as FileSparkles, FileCode } from 'lucide-react';
import { useRouter } from "next/navigation";
import UpdateDoc from "../update";
import { getMyDocList } from "../../../utils/subgraph";

import { useTBContext } from "@/context/Context";
import DocTable from "@/components/templates/table";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import { URLs } from "@/utils/constants";


export default function DocList() {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const [isLoading, setIsLoading] = useState(false);
  const [docList, setDocList] = useState([]);
  const [filterList, setFilterList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [templateList, setTemplateList] = useState([]);
  const [clauseList, setClauseList] = useState([]);

  const { isOnMyDoc, setIsOnMyDoc, docData, setDocData, setTemplate, setClause } = useTBContext();

  const search = (val) => {
    const list = docList.filter((doc) => doc.title.toLowerCase().includes(val.toLowerCase() || doc.type.toLowerCase().includes(val.toLowerCase())));
    setFilterList(list);
  }

  const initData = async () => {
    setIsLoading(true)
    const data = await getMyDocList(address);

    setDocList(data);
    setFilterList(data);
    setIsLoading(false)
  }

  const initTempList = async () => {
    const data = (await axios.get(`${URLs.TBBackendTemplate}/allTemplates`, { withCredentials: true })).data;
    if (data.isSuccess)
      setTemplateList(data.templates);
  }

  const initClsList = async () => {
    const data = (await axios.get(`${URLs.TBBackendClause}/allClauses`, { withCredentials: true })).data;
    if (data.isSuccess)
      setClauseList(data.clauses);
  }

  const setMyDoc = (myDoc) => {
    setDocData(myDoc);
    setIsOnMyDoc(true);
  }

  useEffect(() => {
    if (isConnected) {
      initData()
    } else {
      setFilterList([]);
      setDocList([]);
    }
  }, [isConnected])

  return (
    <>
      {isLoading && (
        <div className="fixed left-0 right-0 top-[60px] bottom-[0px] md:bottom-[0px] flex justify-center items-center backdrop-blur-sm bg-white/5 z-50">
          <ReactLoading type="spinningBubbles" color="#fff" />
        </div>
      )}
      {
        !isOnMyDoc ? (
          <main className="flex-1 container mx-auto px-4 py-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="relative w-1/3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); search(e.target.value) }}
                  className="pl-10 bg-[#2a2d35] border-gray-700 text-gray-200 placeholder-gray-400"
                />

                {/* <Button
                  className="ml-2 bg-[#FFB800] hover:bg-[#FFB800]/90 text-black "
                  onClick={() => search(searchQuery)}
                >
                  Search
                </Button> */}
              </div>

              <div className="flex gap-3">
                <DropdownMenu onOpenChange={(open) => open && initTempList()}>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-[#FFB800] hover:bg-[#FFB800]/90 text-black">
                      <Plus className="h-5 w-5 mr-2" />
                      New Document
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-[#2a2d35] border-gray-700">
                    <DropdownMenuItem
                      onClick={() => { setTemplate(null); router.push('/newDoc') }}
                      className="flex items-center"
                    >
                      <FilePlus className="h-4 w-4 mr-2" />
                      Blank Document
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <div className="max-h-[200px] overflow-y-auto">
                      {templateList.map((temp, index) => (
                        <DropdownMenuItem className="flex items-center" key={index} onClick={() => { setTemplate(temp.url); router.push("/newDoc") }}>
                          <FileCheck className="flex-shrink-0 h-4 w-4 mr-2" />
                          {temp.title}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu onOpenChange={(open) => open && initTempList()}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-gray-700 text-gray-200 hover:bg-gray-700"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      Add Template
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-[#2a2d35] border-gray-700">
                    <DropdownMenuItem
                      onClick={() => { setTemplate(null); router.push('/newTemplate') }}
                      className="flex items-center"
                    >
                      <FilePlus className="h-4 w-4 mr-2" />
                      Blank Template
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <div className="max-h-[200px] overflow-y-auto">
                      {templateList.map((temp, index) => (
                        <DropdownMenuItem className="flex items-center" key={index} onClick={() => { setTemplate(temp.url); router.push("/newTemplate") }}>
                          <FileCheck className="flex-shrink-0 h-4 w-4 mr-2" />
                          {temp.title}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu onOpenChange={(open) => open && initClsList()}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-gray-700 text-gray-200 hover:bg-gray-700"
                    >
                      <Puzzle className="h-5 w-5 mr-2" />
                      Add Clause
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-[#2a2d35] border-gray-700">
                    <DropdownMenuItem
                      onClick={() => { setClause(null); router.push('/newClause') }}
                      className="flex items-center"
                    >
                      <FilePlus className="h-4 w-4 mr-2" />
                      New Clause
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <div className="max-h-[200px] overflow-y-auto">
                      {clauseList.map((cls, index) => (
                        <DropdownMenuItem className="flex items-center" key={index} onClick={() => { setClause(cls.url); router.push("/newClause") }}>
                          <FileCheck className="flex-shrink-0 h-4 w-4 mr-2" />
                          {cls.title}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <DocTable docList={filterList} setDoc={setMyDoc} />
          </main>
        ) : (
          <UpdateDoc docId={docData?.id} cancelUpdate={() => { setIsOnMyDoc(false) }} refresh={initData} />
        )
      }
    </>
  );
}
