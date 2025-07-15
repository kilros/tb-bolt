import { createContext, useContext } from "react";

export const TBContext = createContext();

export const useTBContext = () => useContext(TBContext);