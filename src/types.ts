export type Network = {
    [key: string]: NetworkConfigData
}

export interface NetworkConfigData {
    rpcUrl: string,
    chainId: number,
    explorerUrl?: string
}

