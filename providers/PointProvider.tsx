import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";

export enum PointType {
    _CHAT = 1,
    _PHOTO = 2,
    _VIDEO = 3,
    _AUDIO = 4,
    _LIVE = 5
}


export interface PointContextType {
    selectedPoint: any[];
    setSelectedPoint: React.Dispatch<React.SetStateAction<any[]>>;
}

const PointContext = createContext({});

export const PointProvider = ({ children }: PropsWithChildren) => {

    const [selectedPoint, setSelectedPoint] = useState<any[]>([]);


    useEffect(() => {
        console.log(JSON.stringify(selectedPoint))
    }, [selectedPoint])

    return (
        <PointContext.Provider value={{ selectedPoint, setSelectedPoint }}>
            {children}
        </PointContext.Provider>
    );

}

export const usePoint = () => {
    const context = useContext(PointContext);
    if (!context) {
        throw new Error('usePoint must be used within a PointProvider');
    }
    return context;
}
