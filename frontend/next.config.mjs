/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use turbopack with empty config to silence warning
  turbopack: {},
  // COOP/COEP headers for FHE SDK multi-threading support
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
        ],
      },
    ];
  },
  // Webpack config for WASM support (used in --webpack mode)
  webpack: (config, { isServer }) => {
    // Handle WASM for fhevmjs
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    
    // Fallbacks for browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      // Fix MetaMask SDK react-native dependency
      config.resolve.alias = {
        ...config.resolve.alias,
        '@react-native-async-storage/async-storage': false,
      };
    }
    
    // Suppress circular dependency warnings from FHE SDK
    config.ignoreWarnings = [
      { module: /node_modules\/@zama-fhe/ },
      { message: /Circular dependency/ },
    ];
    
    return config;
  },
};

export default nextConfig;

