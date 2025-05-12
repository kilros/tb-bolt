import React from "react";
export default function Footer({ ...props }) {
  return (
    <>
      <div className="w-full bg-black px-4 md:px-12 py-2">
        <div className="w-full flex justify-between items-center flex-col md:flex-row space-y-8 md:space-y-0">
          <div className="cursor-pointer flex justify-center sm:justify-start">
            <img src="/images/logo.svg" />
          </div>
          <div className="text-white  font-desc2 hidden md:block">
            Tome Block © 2023 COPYRIGHT
          </div>
          <div className="hidden md:block">
            <div className="flex flex-row items-center space-x-4 ">
              {/* <img src="/images/OpenSeaLink.svg" className="cursor-pointer" />
              <img src="/images/TwitterLink.svg" className="cursor-pointer" />
              <img src="/images/DiscordLink.svg" className="cursor-pointer" /> */}
            </div>
          </div>

          <div className="block md:hidden">
            <div className="flex flex-row items-center space-x-4 ">
              {/* <img src="/images/OpenSeaLink.svg" className="cursor-pointer" />
              <img src="/images/TwitterLink.svg" className="cursor-pointer" />
              <img src="/images/DiscordLink.svg" className="cursor-pointer" /> */}
            </div>
          </div>
          <div className="text-white  font-desc2 block md:hidden">
            PROJECT PERSONA © 2023 COPYRIGHT
          </div>
        </div>
      </div>
    </>
  );
}
