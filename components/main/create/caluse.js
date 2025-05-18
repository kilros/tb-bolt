"use client"
import ClauseLib from "@/components/templates/clauseLib";
import Head from "next/head";
import {useRouter} from "next/navigation";

export default function NewClause() {

    const router = useRouter();

    const cancel = () => {
        router.push("/myDocs");
    }

    return (
        <div className="w-full flex-1 flex overflow-y-auto">
            <Head>
                <title>TomeBlock | Create Clause Library</title>
            </Head>
            <ClauseLib  cancel={cancel} />
        </div>
    );
}
