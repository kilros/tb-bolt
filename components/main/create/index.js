"use client"
import {useRouter} from "next/navigation";
import Contract from "../../templates/contract";

export default function NewDoc() {
    const router = useRouter();

    const cancel = () => {
        router.push("/myDocs");
    }

    return (
        <div className="w-full flex-1 flex">
            <Contract isCreate={true} cancel={cancel} bottom={12}/>
        </div>
    );
}