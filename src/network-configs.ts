import { ChainConfig } from "@nomicfoundation/hardhat-verify/types" ;
import {
    NetworksUserConfig,
    HttpNetworkUserConfig,
    HttpNetworkAccountsUserConfig
} from "hardhat/types"
import { NetworkConfig, createNetworkConfig } from "./network-config"
import { Network, NetworkConfigData } from "./types"


export function createNetworkConfigs<SupportedNetworkName extends string>(
    accounts: HttpNetworkAccountsUserConfig,
    networks: Network
) : NetworkConfigs<SupportedNetworkName> {
    return new NetworkConfigs<SupportedNetworkName>(accounts, networks)  
}

export class NetworkConfigs<SupportedNetworkName extends string> {

    constructor(public _accounts: HttpNetworkAccountsUserConfig, public _networks: Network) {
        this._accounts = _accounts ;
        this._networks = _networks ;
    }

    networks(filteredNetworks?: SupportedNetworkName[]) : NetworksUserConfig {
        let networkConfigs: any = {} ;
        let networksToConsider: NetworkConfig[] = [];
        
        if (typeof filteredNetworks === undefined) {
            networksToConsider = this.getNetworks()
        } else {
            this.getNetworks().filter(
                networkConfig => filteredNetworks!.includes(networkConfig.name as SupportedNetworkName)
            )
        }

        networksToConsider.map(
            network => networkConfigs[network.name] = network.config
        )
        return networkConfigs 
    }

    customChains(filteredNetworks?: SupportedNetworkName[]) : ChainConfig[] {
        const networks = this.getNetworks()
        
        if (typeof filteredNetworks === undefined) {
            return networks.map( networkConfig => networkConfig.customChain )
        } 

        return networks
            .filter( networkConfig => filteredNetworks!.includes(networkConfig.name as SupportedNetworkName) )
            .map( networkConfig => networkConfig.customChain )
    }

    network(name: SupportedNetworkName) : HttpNetworkUserConfig {
        return this.networkConfig(name).config
    }

    customChain(name: SupportedNetworkName) : ChainConfig {
        return this.networkConfig(name).customChain
    }

    networkConfig(name: SupportedNetworkName) : NetworkConfig {
        const networkConfig = this._networks[name] as NetworkConfigData
        return createNetworkConfig(name, networkConfig, this._accounts)
    }

    private getNetworks() :  NetworkConfig[] {
        let userNetworkConfig = [] ;

        for (let name in this._networks) {
            const networkConfig = this.networkConfig(name as SupportedNetworkName)
            userNetworkConfig.push(networkConfig)
        }

        return userNetworkConfig
    }

}
