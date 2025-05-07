import { useEffect, useState } from "react";
import { animateScroll as scroll } from 'react-scroll';
import { Button } from "../ui/button";
import { ArrowUp } from "lucide-react";

export default function ScrollBtn({ bottom = 24 }) {

    const [showButton, setShowButton] = useState(false);

    const handleScrollToTop = () => {
        scroll.scrollToTop({ duration: 500, smooth: true });
    };

    useEffect(() => {
        const handleScroll = () => {
            setShowButton(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <Button
            variant="outline"
            size="icon"
            className={`fixed bottom-${bottom} right-2 rounded-full border-gray-700 bg-[#2a2d35] text-gray-200 hover:bg-gray-700 transition-opacity duration-300 ${showButton ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            onClick={handleScrollToTop}
        >
            <ArrowUp className="h-5 w-5" />
        </Button>
    )
}

