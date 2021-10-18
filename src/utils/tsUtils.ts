declare global {
    type CallbackErrorOnly = (error?: Error) => void;
    type Callback<T> = (error: Error, results?: T) => void;
}

const nodeSetImmediate = global.setImmediate;

export const setImmediate = (cb: (...args: any[]) => void, ...args: any[]): void => {
    nodeSetImmediate(cb, ...args);
    return;
};
