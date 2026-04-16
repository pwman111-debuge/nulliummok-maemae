import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://stockanalysis2.pages.dev'

    // Static routes
    const staticRoutes = [
        '',
        '/market',
        '/analysis',
        '/education',
        '/calendar',
        '/picks',
        '/about',
        '/privacy',
        '/terms',
        '/contact',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Dynamic routes (Contentlayer 연동)
    let dynamicRoutes: any[] = []
    try {
        // Note: build 타임에 파일이 생성되므로 require 활용
        const { allMarketAnalyses, allStockReports } = require('contentlayer2/generated')

        if (allMarketAnalyses) {
            const marketEntries = allMarketAnalyses.map((post: any) => ({
                url: `${baseUrl}${post.url}`,
                lastModified: new Date(post.date),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            }))
            dynamicRoutes = [...dynamicRoutes, ...marketEntries]
        }

        if (allStockReports) {
            const stockEntries = allStockReports.map((post: any) => ({
                url: `${baseUrl}${post.url}`,
                lastModified: new Date(post.date),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }))
            dynamicRoutes = [...dynamicRoutes, ...stockEntries]
        }
    } catch (e) {
        console.warn('Sitemap dynamic generation failed (this is normal during dev before build):', e)
    }

    return [...staticRoutes, ...dynamicRoutes]
}
