"use client"
import { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import UpdateDoc from "../update";
import { getSharedList } from "../../../utils/subgraph";
import Table from "../../templates/table";
import { useTBContext } from "../../../context/Context";
import { useAccount, useConfig, useWatchContractEvent } from "wagmi";
import { TBDMSContract } from "../../../utils/contracts";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import DocTable from "../../templates/table";

export default function SharedDocs() {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  useWatchContractEvent({
    ...TBDMSContract,
    eventName: "NewDoc",
    batch: false,
    onLogs(logs) {
      const args = logs[0].args;
      if (args.collabs.filter((collab) => collab.collab == address).length > 0) {
        setTimeout(() => {
          (async () => {
            setIsLoading(true)
            if (isAuth) await initData();
            setIsLoading(false);
          })();
        }, 5000);
      }
    }
  })

  const [searchQuery, setSearchQuery] = useState("")

  const [docList, setDocList] = useState([]);
  const [filterList, setFilterList] = useState([]);

  const { isOnSharedDoc, setIsOnSharedDoc, docData, setDocData, isAuth } = useTBContext();

  const search = () => {
    console.log(docList)
    const list = docList.filter((doc) => doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || doc.createdBy.userName.toLowerCase().includes(searchQuery.toLowerCase()) || doc.createdBy.company.toLowerCase().includes(searchQuery.toLowerCase()) || doc.createdBy.id.includes(searchQuery.toLowerCase()));
    setFilterList(list);
  }

  const setSharedDoc = (sharedDoc) => {
    setDocData(sharedDoc);
    setIsOnSharedDoc(true);
  }

  const initData = async () => {
    setIsLoading(true)
    const data = await getSharedList(address);

    setDocList(data);
    setFilterList(data);
    setIsLoading(false)
  }


  useEffect(() => {
    if (isConnected)
      initData()
    else {
      setDocList([]);
      setFilterList([]);
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
        !isOnSharedDoc ? (
          <>
            <main className="flex-1 container mx-auto px-4 py-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="relative w-1/3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-[#2a2d35] border-gray-700 text-gray-200 placeholder-gray-400"
                  />
                </div>
              </div>
              <DocTable docList={filterList} isShared={true} setDoc={setSharedDoc} />
            </main>
          </>
        ) : (
          <UpdateDoc isShare={true} docId={docData?.id} cancelUpdate={() => { setIsOnSharedDoc(false); }} />
        )
      }
    </>
  );
}
