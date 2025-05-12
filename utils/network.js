export const baseSepolia = {
    id: 84532,
    name: 'Base Sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://base-sepolia-rpc.publicnode.com'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Basescan',
            url: 'https://sepolia.basescan.org',
            apiUrl: 'https://api-sepolia.basescan.org/api',
        },
    },
    contracts: {
        multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 1059647,
        },
    },
}
