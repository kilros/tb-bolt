import { useState } from "react";

export default function Title({value = ""}) {
    const [title, setTitle] = useState(value);
    return (
        <div className="mx-auto w-full">
            <input className="font-bold text-3xl text-black w-full text-center underline" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
    )
}

