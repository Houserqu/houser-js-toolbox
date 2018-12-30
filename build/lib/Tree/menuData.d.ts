export declare const getMenuData: () => ({
    name: string;
    icon: string;
    path: string;
    children: {
        path: string;
        name: string;
    }[];
} | {
    name: string;
    icon: string;
    path: string;
    children: ({
        name: string;
        path: string;
        permission: number[];
        children?: undefined;
    } | {
        name: string;
        path: string;
        children: {
            name: string;
            path: string;
            permission: number[];
        }[];
        permission?: undefined;
    })[];
})[];
