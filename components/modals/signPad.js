"use client"
import { useRef } from 'react';
import Popup from 'reactjs-popup';
import SignaturePad from 'react-signature-canvas';

export default function SignPad({
    setSign
}) {
    const signatureRef = useRef();

    const clearSignature = () => {
        signatureRef.current.clear();
    };

    const saveSignature = () => {
        const signatureImage = signatureRef.current.toDataURL();
        setSign(signatureImage);
    };
    return (
        <Popup
            modal
            trigger={<button className='text-xs rounded-sm py-1 px-2 text-white bg-blue-800 hover:bg-blue-600 w-fit mx-auto h-[30px]'>Add ESign</button>}
            closeOnDocumentClick={false}
        >
            {close => (
                <div className='bg-white p-2 h-fit'>
                    <SignaturePad
                        ref={signatureRef}
                        canvasProps={{
                            className: "border-2 border-black w-full h-[300px]"
                        }}
                    />
                    <div className='flex flex-row justify-center gap-8 pt-2'>
                        <button className='border rounded-md py-1 px-2 text-white bg-blue-800 hover:bg-blue-600' onClick={() => {saveSignature(); close()}}>Save</button>
                        <button className='border rounded-md py-1 px-2 text-white bg-blue-800 hover:bg-blue-600' onClick={clearSignature}>Clear</button>
                        <button className='border rounded-md py-1 px-2 text-white bg-blue-800 hover:bg-blue-600' onClick={close}>Close</button>
                    </div>
                </div>
            )}
        </Popup>
    );
}
