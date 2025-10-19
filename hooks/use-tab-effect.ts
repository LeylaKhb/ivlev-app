import { usePathname } from "expo-router";
import { useEffect } from "react";

export function useTabEffect(route: string, effect: () => void) {
    const path = usePathname();
    useEffect(() => {
        if (path === route) {
            effect();
        }
    }, [path])
}