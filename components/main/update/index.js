import Head from "next/head";
import Contract from "../../templates/contract";

export default function UpdateDoc({ isShare = false, docId, cancelUpdate = () => { } }) {
    
    return (
        <div className="w-full flex-1 flex overflow-y-auto">
            <Contract isShare={isShare} docId={docId} cancel={cancelUpdate} />
        </div >
    );
}
