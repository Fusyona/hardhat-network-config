import { vars } from "hardhat/config"
import { HttpNetworkUserConfig, HttpNetworkAccountsUserConfig  } from "hardhat/types"
import { ChainConfig } from "@nomicfoundation/hardhat-verify/types" ;
import { NetworkConfigData } from "./types"


export function createNetworkConfig(
    name: string,
    data: NetworkConfigData,
    accounts: HttpNetworkAccountsUserConfig
) : NetworkConfig {
    return new NetworkConfig(name, data, accounts)  
}

export class NetworkConfig {

    public name: string ;
    public rpcUrl: string ;
    public chainId: number ;
    public explorerUrl: string ;
    public accounts: HttpNetworkAccountsUserConfig ;

    constructor(name: string, data: NetworkConfigData, accounts: HttpNetworkAccountsUserConfig) {
        this.name = name ;
        this.rpcUrl = this.useRpcUrl(data.rpcUrl) ;
        this.chainId = data.chainId ;
        this.explorerUrl = data.explorerUrl! ;
        this.accounts = accounts ;
    }

    withAccounts(accounts: HttpNetworkAccountsUserConfig) {
        this.accounts = accounts ;
        return this ;
    }

    useRpcUrl(rpcUrl: string) {
        if ( !this.rpcUrlNeedsApiKey(rpcUrl) ) return rpcUrl

        const apiKey = vars.get(this.rpcUrlApiKeyName(rpcUrl)) ;
        return rpcUrl.replace(
            this.rpcUrlApiKeyPattern(rpcUrl),
            apiKey
        )
    }

    get config() : HttpNetworkUserConfig {
        return {
            url: this.rpcUrl,
            chainId: this.chainId,
            accounts: this.accounts,
        }
    }

    get explorerApiUrl() : string {
        return `${this.explorerUrl}/api`
    }

    get customChain() : ChainConfig {
        return {
            network: this.name,
            chainId: this.chainId,
            urls: {
                apiURL: this.explorerApiUrl,
                browserURL: this.explorerUrl,
            }
        }
    }

    private rpcUrlNeedsApiKey(rpcUrl: string) : boolean {
        return this.rpcUrlApiKeyMatches(rpcUrl) !== null
    }

    private rpcUrlApiKeyName(rpcUrl: string) : string {
        return this.rpcUrlApiKeyMatches(rpcUrl)?.[1]! // returns `PATTERN` without the `{}`
    }

    private rpcUrlApiKeyPattern(rpcUrl: string) : string {
        return this.rpcUrlApiKeyMatches(rpcUrl)?.[0]! // returns `{PATTERN}`
    }

    private rpcUrlApiKeyMatches(rpcUrl: string) : RegExpMatchArray | null {
        return rpcUrl.match(/\{(.+)\}/)
    }

}
