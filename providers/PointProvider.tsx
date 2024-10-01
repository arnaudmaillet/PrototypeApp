import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";

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
