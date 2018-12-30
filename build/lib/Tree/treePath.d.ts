declare const menuData: ({
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
declare function find(keys: any): any[];
