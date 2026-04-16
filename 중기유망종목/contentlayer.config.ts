
import { defineDocumentType, makeSource } from 'contentlayer2/source-files'

export const MarketAnalysis = defineDocumentType(() => ({
    name: 'MarketAnalysis',
    filePathPattern: `market-analysis/**/*.mdx`,
    contentType: 'mdx',
    fields: {
        title: { type: 'string', required: true },
        date: { type: 'date', required: true },
        category: { type: 'enum', options: ['daily', 'weekly', 'monthly', 'special', 'Genesis', 'macro'], required: true },
        tags: { type: 'list', of: { type: 'string' } },
        summary: { type: 'string', required: true },
        ticker: { type: 'string' },
        thumbnail: { type: 'string' },
    },
    computedFields: {
        url: { type: 'string', resolve: (post) => `/market/${post._raw.flattenedPath.split('/').pop()}` },
    },
}))

export const StockPick = defineDocumentType(() => ({
    name: 'StockPick',
    filePathPattern: `picks/**/*.mdx`,
    contentType: 'mdx',
    fields: {
        title: { type: 'string', required: true },
        ticker: { type: 'string', required: true },
        market: { type: 'enum', options: ['KOSPI', 'KOSDAQ', 'KONEX', 'KOSPI/KOSDAQ'], required: true },
        term: { type: 'enum', options: ['short', 'mid', 'long'], required: true },
        date: { type: 'date', required: true },
        updatedAt: { type: 'date' },
        status: { type: 'enum', options: ['active', 'closed', 'watching'], default: 'active' },
        currentPrice: { type: 'number', required: true },
        targetPrice: { type: 'number', required: true },
        stopLoss: { type: 'number', required: true },
        expectedReturn: { type: 'string' },
        holdingPeriod: { type: 'string' },
        tags: { type: 'list', of: { type: 'string' } },
        summary: { type: 'string', required: true },
        thumbnail: { type: 'string' },
    },
    computedFields: {
        url: { type: 'string', resolve: (post) => `/picks/${post._raw.flattenedPath.split('/').pop()}` },
    },
}))

export const StockReport = defineDocumentType(() => ({
    name: 'StockReport',
    filePathPattern: `stock-reports/**/*.mdx`,
    contentType: 'mdx',
    fields: {
        title: { type: 'string', required: true },
        ticker: { type: 'string', required: true },
        market: { type: 'enum', options: ['KOSPI', 'KOSDAQ', 'NYSE', 'NASDAQ', 'NAS/NYSE'], required: true },
        date: { type: 'date', required: true },
        updatedAt: { type: 'date' },
        reportType: { type: 'enum', options: ['fundamental', 'technical', 'sector', 'esg'], required: true },
        rating: { type: 'enum', options: ['buy', 'hold', 'sell', 'not-rated'], required: true },
        currentPrice: { type: 'number', required: true },
        targetPrice: { type: 'number', required: true },
        stopLoss: { type: 'number' },
        term: { type: 'enum', options: ['short', 'mid', 'long'], required: false },
        priceUpside: { type: 'string' },
        sector: { type: 'string' },
        category: { type: 'string' },
        marketCap: { type: 'string' },
        tags: { type: 'list', of: { type: 'string' } },
        summary: { type: 'string', required: true },
        thumbnail: { type: 'string' },
    },
    computedFields: {
        url: { type: 'string', resolve: (post) => `/analysis/${post._raw.flattenedPath.split('/').pop()}` },
    },
}))


export const Education = defineDocumentType(() => ({
    name: 'Education',
    filePathPattern: `education/**/*.mdx`,
    contentType: 'mdx',
    fields: {
        title: { type: 'string', required: true },
        date: { type: 'date', required: true },
        category: { type: 'string', required: true },
        time: { type: 'string', required: true },
        level: { type: 'enum', options: ['초급', '중급', '고급'], required: true },
        summary: { type: 'string', required: true },
    },
    computedFields: {
        url: { type: 'string', resolve: (post) => `/education/${post._raw.flattenedPath.substring(post._raw.flattenedPath.lastIndexOf('/') + 1)}` },
        slug: { type: 'string', resolve: (post) => post._raw.flattenedPath.substring(post._raw.flattenedPath.lastIndexOf('/') + 1) },
    },
}))

export const MarketInsight = defineDocumentType(() => ({
    name: 'MarketInsight',
    filePathPattern: `market-insight/**/*.mdx`,
    contentType: 'mdx',
    fields: {
        title: { type: 'string', required: true },
        date: { type: 'date', required: true },
        category: { type: 'enum', options: ['fomc', 'macro', 'special', 'trend'], required: true },
        tags: { type: 'list', of: { type: 'string' } },
        summary: { type: 'string', required: true },
        thumbnail: { type: 'string' },
    },
    computedFields: {
        url: { type: 'string', resolve: (post) => `/insight/${post._raw.flattenedPath.substring(post._raw.flattenedPath.lastIndexOf('/') + 1)}` },
    },
}))


export const StockPickFeedback = defineDocumentType(() => ({
    name: 'StockPickFeedback',
    filePathPattern: `picks-feedback/**/*.mdx`,
    contentType: 'mdx',
    fields: {
        title: { type: 'string', required: true },
        date: { type: 'date', required: true },
        summary: { type: 'string', required: true },
        tags: { type: 'list', of: { type: 'string' } },
        thumbnail: { type: 'string' },
    },
    computedFields: {
        url: { type: 'string', resolve: (post) => `/picks/feedback/${post._raw.flattenedPath.split('/').pop()}` },
    },
}))

export default makeSource({
    contentDirPath: 'content',
    documentTypes: [MarketAnalysis, StockPick, StockReport, Education, MarketInsight, StockPickFeedback],
})
