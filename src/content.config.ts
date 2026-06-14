import { defineCollection, reference } from 'astro:content';
import {glob} from 'astro/loaders'
import {z} from 'astro/zod'


const blog=defineCollection({
    loader:glob({base:'./src/content/blog',pattern:'**/*.{md,mdx}'}),
    schema:z.object({
        title:z.string(),
        description:z.string(),
        author:reference('authors'),
        pubDate:z.coerce.date(),
        relatedPosts:z.array(reference('blog')).optional().default([]),
    })
})

const authors=defineCollection({
    loader:glob({pattern:'**/*.json',base:'./src/data/authors'}),
    schema:z.object({
        name:z.string(),
        portfolio:z.url(),
    })
})


export const collections={blog,authors}