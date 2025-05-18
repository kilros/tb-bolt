import "react-toastify/dist/ReactToastify.css";
import { adrEllipsis } from "../../utils/utility";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

const statusDic = {
    0: {
        color: "text-stone-400",
        title: "No Request"
    },
    1: {
        color: "text-red-500",
        title: "On Request"
    },
    2: {
        color: "text-green-500",
        title: "Confirmed"
    },
    3: {
        color: "text-sky-500",
        title: "Signed"
    },
}
export default function DocTable({ docList, isShared = false, setDoc = () => { } }) {
    return (
        <div className="bg-[#2a2d35] rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-gray-700">
                        <TableHead className="text-gray-300 font-medium">DocID</TableHead>
                        {isShared && (
                            <>
                                <TableHead className="text-gray-300 font-medium">CreatorName</TableHead>
                                <TableHead className="text-gray-300 font-medium">Company</TableHead>
                                <TableHead className="text-gray-300 font-medium">CreatorAddr</TableHead>
                            </>
                        )}
                        <TableHead className="text-gray-300 font-medium">Title</TableHead>
                        <TableHead className="text-gray-300 font-medium">Category</TableHead>
                        <TableHead className="text-gray-300 font-medium">Created Date</TableHead>
                        <TableHead className="text-gray-300 font-medium">Status</TableHead>
                        <TableHead className="text-gray-300 font-medium">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {docList.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center text-gray-400 py-8">
                                No documents found
                            </TableCell>
                        </TableRow>
                    ) : (
                        docList.map((doc) => (
                            <TableRow key={doc.id} className="border-b border-gray-700">
                                <TableCell className="text-gray-300">{doc.id}</TableCell>
                                {
                                    isShared && (
                                        <>
                                            <TableCell className="text-gray-300">{doc.createdBy.userName}</TableCell>
                                            <TableCell className="text-gray-300">{doc.createdBy.company}</TableCell>
                                            <TableCell className="text-gray-300">
                                                <div className="flex items-center gap-2">
                                                    <span>{adrEllipsis(doc.createdBy.id, 4)}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => navigator.clipboard.writeText(doc.createdBy.id)}
                                                        className="h-6 w-6 text-gray-400 hover:text-gray-200"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </>
                                    )
                                }
                                <TableCell className="text-gray-300">{doc.title}</TableCell>
                                <TableCell className="text-gray-300">{doc.type}</TableCell>
                                <TableCell className="text-gray-300">
                                    {new Date(doc.createdAt * 1000).toLocaleDateString()}
                                </TableCell>
                                <TableCell className={`text-gray-300 ${statusDic[doc.status].color}`}>{statusDic[doc.status].title}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDoc(doc)}
                                        className="text-[#FFB800] hover:text-[#FFB800]/90"
                                    >
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
