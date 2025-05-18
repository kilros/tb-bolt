"use client"
import { useRef, useState, useEffect } from "react";
import { useAccount, useConfig, useWatchContractEvent } from "wagmi";
import { useReactToPrint } from "react-to-print";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import ReactLoading from "react-loading";

import axios from "axios";
import { animateScroll as scroll } from 'react-scroll';
import SignPad from "../modals/signPad";

import CreateDocModal from "../modals/createDocModal";
import {
  addCollabsToDoc,
  confirmDoc,
  confirmRequest,
  createNewContract,
  finalizeDoc,
  readDocContent,
  removeCollabsFromDoc,
  requestUpdate,
  revokeDoc,
  revokeRequest,
  signOnDoc,
} from "../../utils/interact";
import {
  getDocData,
  getDocHistory,
  getESignData,
  getRequestConfirmStatus,
  getRequestData,
} from "../../utils/subgraph";
import { URLs, template2 } from "../../utils/constants";
import AddCollabsModal from "../modals/addCollabsModal";
import RemoveCollabsModal from "../modals/removeCollabsModal";
import ChatModal from "../modals/chatModal";

import {
  TBDMSContract,
} from "../../utils/contracts";
import { useTBContext } from "@/context/Context";
import Template from "./template";
import ScrollBtn from "@/components/base/scrollBtn";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUp, Clock, History, MessageCircle, UserPlus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getApprovalStatus } from "@/utils/utility";

export default function Contract({
  isCreate = false,
  docId = 0,
  isShare = false,
  bottom = 24,
  cancel = () => { },
}) {

  const router = useRouter();

  const config = useConfig();
  const { address } = useAccount();
  const [content, setContent] = useState(template2);
  const { template } = useTBContext();

  const container = useRef(null);

  useWatchContractEvent({
    ...TBDMSContract,
    onLogs(logs) {
      const args = logs[0].args;
      const eventName = logs[0].eventName;
      if (Number(args.docId) == docId && eventName != "NewDoc" && args.collab != address) {
        if (eventName == "ConfirmRequest" || eventName == "RevokeRequest") {
          refreshReqlist()
        } else {
          refreshDoc();
        }
      }
    }
  })

  const handlePrint = useReactToPrint({
    pageStyle: `@media print {
            @page {
                size: 1150px 1414px;
                margin: 25mm 20mm 20mm 20mm;
            }
        }`,
    content: () => container.current,
  });
  const [docData, setDocData] = useState(null);

  const socketRef = useRef(null);

  const [cid, setCID] = useState(null);
  const [lastCID, setLastCID] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const [isCreateDocModalOpen, setIsCreateDocModalOpen] = useState(false);
  const [isAddCollabModalOpen, setIsAddCollabModalOpen] = useState(false);
  const [isRemoveCollabModalOpen, setIsRemoveCollabModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const [collabData, setCollabData] = useState(null);

  const [collabToRemove, setCollabToRemove] = useState(null);

  const [isSigned, setIsSigned] = useState(false);
  const [esign, setESign] = useState(null);
  const [esignList, setESignList] = useState([]);

  const [numOfUnread, setNumOfUnread] = useState(0)
  const [pastReq, setPastReq] = useState(0);
  const [history, setHistory] = useState([]);

  const [showHistory, setShowHistory] = useState(false);


  const [messages, setMessages] = useState([]);

  // const checkAuth = () => {
  //   if (!isAuthenticated) {
  //     toast.error("You have to sign in at first!");
  //     return false;
  //   } else {
  //     return true;
  //   }
  // };

  const connectChatRoom = () => {
    setIsChatModalOpen(true);
  }

  const createContract = async (title, type, collabs) => {
    setIsLoading(true);
    const res = await createNewContract(config, address, title, type, collabs, content);
    if (res) {
      setTimeout(() => {
        (() => {
          setIsLoading(false);
          cancel();
        })();
      }, 5000);
    } else setIsLoading(false);
  };

  const cancelView = () => {
    cancel();
    if (isShare) {
      router.push("/sharedDocs");
    } else {
      router.push("/myDocs");
    }
  };

  const refreshReqlist = () => {
    setTimeout(() => {
      (async () => {
        setIsLoading(true)
        await initRequestStatus();
        await initHistory();
        setIsLoading(false);
      })();
    }, 3000);
  }

  const refreshDoc = () => {
    setTimeout(() => {
      (async () => {
        setIsLoading(true)
        await refreshDocData();
        setIsLoading(false);
      })();
    }, 3000);
  }

  const approveRequest = async () => {
    // if (checkAuth()) {
    setIsLoading(true);
    const res = await confirmRequest(config, docData.currentReq);
    setIsLoading(false);
    refreshReqlist();
    // }
  };

  const declineRequest = async () => {
    // if (checkAuth()) {
    setIsLoading(true);
    await revokeRequest(config, docData.currentReq);
    setIsLoading(false);
    refreshReqlist();
    // }
  };

  const addCollabs = async () => {
    setIsAddCollabModalOpen(true)
  }

  const addCollabsToContract = async (collabs) => {
    setIsLoading(true);
    await addCollabsToDoc(config, docId, collabs);
    setIsLoading(false);
    refreshDoc();
  }

  const removeCollabsFromContract = async () => {
    setIsLoading(true);
    await removeCollabsFromDoc(config, docId, [collabToRemove]);
    setIsLoading(false);
    refreshDoc();
  }

  const confirmDocContent = async () => {
    // if (checkAuth()) {
    setIsLoading(true);
    await confirmDoc(config, docData.currentReq);
    setIsLoading(false);
    refreshDoc();
    // }
  };

  const revokeDocContent = async () => {
    // if (checkAuth) {
    setIsLoading(true);
    await revokeDoc(config, docData.currentReq);
    setIsLoading(false);
    refreshReqlist();
    // }
  };

  const updateContract = async () => {
    setIsLoading(true);
    await requestUpdate(config, address, docId, content);
    setIsLoading(false);
    refreshDoc();
  };

  const finalizeContract = async () => {
    setIsLoading(true);
    await finalizeDoc(config, docId);
    setIsLoading(false);
    refreshDoc();
  }

  const confirmSign = async () => {
    if (esign) {
      setIsLoading(true);
      await signOnDoc(config, address, docId, esign);
      setIsLoading(false);
      refreshDoc();
    } else {
      scroll.scrollToBottom({ duration: 500, smooth: true });
    };
  };

  const initRequestStatus = async () => {
    const res = await getRequestConfirmStatus(docData.currentReq, docId);
    if (res)
      setCollabData(res);
  };

  const initHistory = async () => {
    const his = await getDocHistory(docId, address);
    setHistory(his);
  }

  const readHisReq = async (reqId) => {
    setIsLoading(true);

    const request = await getRequestData(reqId);
    if (request) {
      setDocData({ ...docData, status: 1 })
      setPastReq(reqId);
      setCID(request.requestCID);
      const data = await readDocContent(request.requestCID);
      if (data.isSuccess) {
        setContent(JSON.parse(data.decrypt));
      }
    }
    setIsLoading(false);
  }

  const initTemplate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(template);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const jsonData = await response.json();

      setContent(jsonData)

    } catch (error) {
      console.log(error)
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (esign) {
      scroll.scrollToTop({ duration: 500, smooth: true });
    }

  }, [esign])



  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);

      await initHistory();

      if (docData?.status == 0) {
        const data = await readDocContent(docData.cid);
        if (data.isSuccess) {
          let docContent = data.decrypt;
          docContent = docContent.replaceAll(`"highlight":true`, `"highlight":false`);
          setContent(JSON.parse(docContent));
        }
        setCID(docData.cid);
      } else if (docData?.status == 1) {
        const request = await getRequestData(docData.currentReq);
        if (request) {
          setCID(request.requestCID);
          const data = await readDocContent(request.requestCID);
          if (data.isSuccess) {
            setContent(JSON.parse(data.decrypt));
          }

          // setRequester(request.collab);
        }
      } else if (docData?.status > 1) {
        setCID(docData.cid);
        const data = await readDocContent(docData.cid);
        if (data.isSuccess) {
          setContent(JSON.parse(data.decrypt));
        }
      }
      if (docData?.status >= 2) {
        const data = await getESignData(address, docId);
        if (data) {
          setIsSigned(data.isSigned);
          setESignList(data.esignList);
        }
      }

      if (docData?.requests.length > 1 && docData.status == 1) {
        setLastCID(docData.cid);
      }

      if (docData?.status < 2)
        await initRequestStatus();
      setIsLoading(false);
    };
    if (docData) initData();
  }, [docData]);

  useEffect(() => {
    if (isCreate) {
      initTemplate();
    }
  }, [isCreate])

  const getUnreads = async () => {
    try {
      const res = await axios.post(`${URLs.TBBackendChat}/getnewmsgsnum`, ({ userId: address.toLowerCase(), group: docId }), { withCredentials: true }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.data.isSuccess) {
        setNumOfUnread(res.data.num);
      }

    } catch {
    }
  }
  const refreshDocData = async () => {
    setIsLoading(true);
    if (docId) {
      const data = await getDocData(docId);
      setDocData(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (docId > 0) {
      refreshDocData();
      getUnreads();
    }
    // }, [isAuthenticated]);
  }, []);

  useEffect(() => {
    // Initialize the socket connection once
    if (address && docId > 0) {
      socketRef.current = io(URLs.TBBackend);

      socketRef.current.emit('join-room', address, docId);

      // Set up the event listener for receiving messages
      socketRef.current.on("receive-message", (userId, userName, message) => {
        if (userId != address) setNumOfUnread((cur) => cur + 1);

        setMessages((prevMessages) => [...prevMessages, { userId: userId, userName: userName, message: message, time: (new Date()).getTime() }]);
      });

      return () => {
        socketRef.current.disconnect();
      };
    }

  }, [address]);

  return (
    <>
      {isLoading && (
        <div className="fixed left-0 right-0 top-[60px] bottom-[0px] md:bottom-[0px] flex justify-center items-center backdrop-blur-sm bg-black/5 z-50">
          <ReactLoading type="spinningBubbles" color="#ff0" />
        </div>
      )}
      <div className="container mx-auto px-4 py-6">
        <div className="w-full bg-[#2a2d35] rounded-lg p-6">
          {!isCreate && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={cancelView}
                    className="text-gray-300 hover:text-gray-100"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <h2 className="text-xl font-semibold text-gray-200">{docData?.title}</h2>
                </div>
                {pastReq == 0 && (
                  <>
                    {docData?.status == 1 && !collabData?.revoked && collabData?.waitingList.filter((item) => item.id == address?.toLocaleLowerCase()).length > 0 && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={declineRequest}
                          className="border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        >
                          Revoke
                        </Button>
                        <Button
                          onClick={approveRequest}
                          className="bg-yellow-500 hover:bg-yellow-500/80 text-black hover:text-white"
                        >
                          Approve
                        </Button>
                      </div>
                    )}
                    {docData?.status == 1 && (
                      <>
                        {collabData?.confirmNum == docData.collabs.length && (
                          <Button
                            onClick={confirmDocContent}
                            className="bg-yellow-500 hover:bg-yellow-500/80 text-black hover:text-white"
                          >
                            Confirm Update
                          </Button>
                        )}
                        {
                          collabData?.revoked && (
                            <Button
                              variant="outline"
                              onClick={revokeDocContent}
                              className="border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                            >
                              Revoke Update
                            </Button>
                          )
                        }
                      </>
                    )}
                    {docData?.status == 0 && (
                      <div className="flex flex-row gap-2">
                        <Button
                          onClick={updateContract}
                          className="bg-yellow-500 hover:bg-yellow-500/80 text-black hover:text-white"
                        >
                          Update
                        </Button>
                        {docData.createdBy.id == address?.toLowerCase() && (
                          <Button
                            onClick={finalizeContract}
                            className="bg-sky-500 hover:bg-sky-500/80 text-black hover:text-white"
                          >
                            Finalize
                          </Button>
                        )}
                      </div>
                    )}
                    {docData?.status == 2 && !isSigned && (
                      <Button
                        onClick={confirmSign}
                        className="bg-green-500 hover:bg-green-500/80 text-white"
                      >
                        Add ESignate
                      </Button>
                    )}
                    {docData?.status == 3 && (
                      <Button
                        onClick={handlePrint}
                        className="bg-blue-500 hover:bg-blue-500/80 text-white"
                      >
                        Download PDF
                      </Button>
                    )}
                  </>
                )}
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowHistory(!showHistory)}
                  className="border-gray-700 text-gray-200 hover:bg-gray-700 mb-2"
                >
                  <History className="h-4 w-4 mr-2" />
                  {showHistory ? 'Hide History' : 'Show History'}
                </Button>
              </div>
            </div>
          )}
          {pastReq == 0 && docData?.status < 2 && (
            <div className="p-4 bg-[#1a1d21] rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-200">Collaborators</h3>
                {docData?.createdBy.id == address?.toLowerCase() && (
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200" onClick={addCollabs}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                {collabData?.collabList.map((collab, index) => {
                  const status = getApprovalStatus(collab.status);
                  const clb = collab.collab;
                  const role = collab.role;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg bg-[#2a2d35] border border-gray-700"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-yellow-500/10 text-yellow-500 text-sm font-semibold">
                          {clb.userName[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-200">{clb.userName}{clb.id == address?.toLocaleLowerCase() ? "(You)" : ""}</span>
                        <span className="text-xs text-gray-400 capitalize">{role}</span>
                      </div>
                      {docData?.status == 0 ? (
                        <Badge
                          variant="outline"
                          className={`ml-2 bg-gray-500/10 text-gray-500 border-gray-500/20`}
                        >
                          No Action
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className={`ml-2 ${status.color}`}
                        >
                          {status.label}
                        </Badge>
                      )}

                      {docData?.createdBy.id == address?.toLowerCase() && clb.id != address?.toLowerCase() && (
                        <Button
                          size="sm"
                          onClick={() => { setCollabToRemove(clb.id); setIsRemoveCollabModalOpen(true) }}
                          className="bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 hover:text-gray-200 h-7 w-7 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {showHistory && (
            <div className="p-4 bg-[#1a1d21] rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium text-gray-200 mb-4">Document History</h3>
              <div className="space-y-4">
                {history?.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-[#2a2d35] border border-gray-700"
                  >
                    <div className="mt-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-200">
                          {event.name}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">
                          {(new Date(event.time)).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">
                        <span className={`font-medium ${event.color} ${event.link ? "underline cursor-pointer" : ""}`} onClick={event.link ? () => readHisReq(event.link) : () => { }}>
                          {event.desc}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="border-gray-700 text-gray-200 hover:bg-gray-700"
                  onClick={() => { setPastReq(0); refreshDocData(); }}
                >
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Go to Current
                </Button>
              </div>
            </div>
          )}
          {pastReq == 0 && docData?.status == 2 && (
            <div className="p-4 bg-[#1a1d21] rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-200">Collaborators</h3>
              </div>
              <div className="flex flex-wrap gap-4">
                {esignList?.map((esn, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg bg-[#2a2d35] border border-gray-700"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-yellow-500/10 text-yellow-500 text-sm font-semibold">
                        {esn.collab.userName[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-200">{esn.collab.userName}{esn.collab.id == address?.toLowerCase() ? "(You)" : ""}</span>
                      <span className="text-xs text-gray-400 capitalize">{esn.role}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`ml-2 ${esn.isSigned ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"}`}
                    >
                      {esn.isSigned ? "ESigned" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isCreate && (
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-200">New Document</h2>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/myDocs')}
                  className="border-gray-700 text-gray-200 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setIsCreateDocModalOpen(true)}
                  className="bg-yellow-500 hover:bg-yellow-500/90 text-black"
                >
                  Save Document
                </Button>
              </div>
            </div>
          )}
          <div className="mt-2" ref={container} >
            <Template status={docData ? docData.status : 10} content={content} setContent={setContent} isShowToolbar={isCreate || docData?.status == 0} readOnly={
              isCreate ? false : docData?.status != 0 ? true : false
            } />
            {docData?.status >= 2 && (
              <div className="flex flex-row justify-center gap-40 text-2xl pb-20 bg-white">
                {
                  esignList.map((item, index) => {
                    const isUser = item.collab.id == address?.toLowerCase();
                    return (
                      <div className="flex flex-col gap-6" key={index}>
                        <div className="flex flex-col">
                          <div className="text-center font-bold text-black">{item.role}</div>
                          <div className="flex flex-col gap-2 mt-4 mx-auto">
                            {isUser && !item.isSigned ? (
                              <SignPad setSign={setESign} />
                            ) : (
                              <div className="h-[30px]" />
                            )}
                            {item.cid ? (
                              <img
                                src={URLs.TBGateWay + item.cid}
                                alt="investor signature"
                                className="w-[200px] aspect-radio"
                              />
                            ) : isUser && esign ? (
                              <img
                                src={esign}
                                alt="investor signature"
                                className="w-[200px] aspect-radio"
                              />
                            ) : (
                              <div className="h-[73.42px]" />
                            )}
                          </div>
                          <div className="mt-12 text-center text-black">
                            {item.date ? (
                              <div>{new Date(item.date * 1000).toISOString().substring(0, 10)}</div>
                            ) : (
                              <div></div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            )}
          </div>
        </div>
        {docId > 0 && (
          <div className="fixed bottom-6 right-2">
            <Button
              size="icon"
              className="h-12 w-12 rounded-full bg-gradient-to-r from-[#FFB800] to-[#FF8A00] hover:from-[#FFB800]/90 hover:to-[#FF8A00]/90 text-black shadow-lg"
              onClick={connectChatRoom}
            >
              <MessageCircle className="h-6 w-6" />
              {numOfUnread > 0 && (
                <div className="flex justify-center leading-4 rounded-full bg-red-700 absolute top-0 right-0 text-[10px] text-white font-bold w-4 h-4">{numOfUnread}</div>
              )}
            </Button>
          </div>
        )}
      </div >
      <ScrollBtn bottom={bottom} />

      <ChatModal
        openModal={isChatModalOpen}
        resetUnreads={() => setNumOfUnread(0)}
        roomId={docId}
        socket={socketRef.current}
        setMessages={setMessages}
        messages={messages}
        changeModalOpen={setIsChatModalOpen}
      />
      <CreateDocModal
        confirm={createContract}
        openModal={isCreateDocModalOpen}
        changeModalOpen={setIsCreateDocModalOpen}
      />
      <AddCollabsModal
        confirm={addCollabsToContract}
        openModal={isAddCollabModalOpen}
        changeModalOpen={setIsAddCollabModalOpen}
      />
      <RemoveCollabsModal
        confirm={removeCollabsFromContract}
        cancel={() => setCollabToRemove(null)}
        openModal={isRemoveCollabModalOpen}
        changeModalOpen={setIsRemoveCollabModalOpen}
      />
    </>
  );
}