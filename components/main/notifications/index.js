"use client"
import { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import { useAccount, useConfig } from "wagmi";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { MessageSquare, FileText, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { URLs } from "../../../utils/constants";
import { getNotifications } from "../../../utils/subgraph";
import { useTBContext } from "../../../context/Context";
import axios from "axios";

export default function Notifications() {
  const { address, chainId } = useAccount();
  const config = useConfig();
  const router = useRouter();

  const { setDocData, setIsOnMyDoc, setIsOnSharedDoc } = useTBContext();

  const [notifications, setNotifications] = useState([]);
  const [relations, setRelations] = useState([]);
  const [unreadChats, setUnreadChats] = useState([]);

  const [lastTime, setLastTime] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const openDoc = (notification) => {
    setDocData({
      id: notification.docId,
    })
    if (notification.isMyDoc) {
      setIsOnMyDoc(true);
      router.push("/myDocs")
    } else {
      setIsOnSharedDoc(true);
      router.push("/sharedDocs")
    }
  }

  const openChat = (docId) => {
    setDocData({
      id: docId,
    })
    const rel = relations.filter((rel) => rel.document.id == docId)[0];
    if (rel.isOwner) {
      setIsOnMyDoc(true);
      router.push("/myDocs")
    } else {
      setIsOnSharedDoc(true);
      router.push("/sharedDocs")
    }
  }

  const initNotifications = async () => {
    setIsLoading(true);
    const data = await getNotifications(address, lastTime);
    if (data) {
      setNotifications(data.history);
      const relArr = data.relations;
      setRelations(relArr);

      let groups = [];
      let docDic = {};
      relArr.map((rel) => { groups.push(rel.document.id); docDic[rel.document.id] = rel.document.title });

      const chatData = await axios.post(`${URLs.TBBackendChat}/readnewmsgs`, ({ userId: address.toLowerCase(), groups: groups }), { withCredentials: true }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (chatData.data.isSuccess) {
        const numArr = chatData.data.numArr;
        numArr.map((data) => ({ numData: data, title: docDic[data.group] }))
        setUnreadChats(numArr);
      }
    }

    await axios.post(`${URLs.TBBackendTime}/setLastCheckTime`, ({ userId: address.toLowerCase() }), { withCredentials: true }, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (data.isSuccess) {
      setLastTime(data.time);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    const fetchLastCheckTime = async () => {
      try {
        const data = (await axios.get(`${URLs.TBBackendTime}/readLastCheckTime?userId=${address.toLowerCase()}`, { withCredentials: true })).data;

        if (data.isSuccess) {
          setLastTime(data.time);
        }
      } catch (error) {
        console.error("Error fetching last check time:", error);
      }
    }
    if (config.chains[0].id == chainId && address) {
      fetchLastCheckTime();
    }
    // }, [isAuthenticated, chainId])
  }, [chainId])

  useEffect(() => {
    if (lastTime != null) {
      initNotifications();
    }
  }, [lastTime])

  return (
    <>
      {isLoading && (
        <div className="fixed left-0 right-0 top-[60px] md:top-[80px] bottom-[0px] md:bottom-[0px] flex justify-center items-center backdrop-blur-sm bg-white/5 z-50">
          <ReactLoading type="spinningBubbles" color="#fff" />
        </div>
      )}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="contracts" className="w-full">
          <TabsList className="bg-[#2a2d35] border-gray-700">
            <TabsTrigger value="contracts" className="data-[state=active]:bg-[#1a1d21]">
              <FileText className="h-4 w-4 mr-2" />
              Contract Updates
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-[#1a1d21]">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contracts" className="mt-6">
            <div className="space-y-4">
              {notifications.map((noti, index) => (
                <Card key={index} className={`p-4 bg-[#2a2d35] border-gray-700 ${noti.isNew ? 'border-l-4 border-l-[#FFB800]' : ''}`}>
                  <div className="flex items-start justify-between cursor-pointer" onClick={() => { openDoc(noti) }}>
                    <div className="flex-1">
                      <h3 className="text-gray-200 font-medium">{noti.desc}</h3>
                      <p className="text-gray-400 text-sm mt-1">{noti.docTitle}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400">{(new Date(noti.time)).toLocaleString()}</span>
                      </div>
                    </div>

                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <div className="space-y-4">
              {unreadChats.map((chat, index) => (
                <Card key={index} className="p-4 bg-[#2a2d35] border-gray-700 border-l-4 border-l-[#FFB800]">
                  <div className="flex items-start justify-between cursor-pointer" onClick={() => { openChat(chat.numData.group) }}>
                    <div className="flex-1">
                      <h3 className="text-gray-200 font-medium">{chat.numData.number} New Messages</h3>
                      <p className="text-gray-400 text-sm mt-1">{chat.title}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

    </>
  );
}
