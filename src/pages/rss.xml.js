import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
export async function GET(context){
    const posts=await getCollection('blog');

   // 获取所有作者数据（用于解析引用）
    const authors = await getCollection('authors');
    
    // 创建作者 ID 到作者数据的映射
    const authorMap = new Map();
    authors.forEach(author => {
        authorMap.set(author.id, author.data);
    });

    return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
     items: posts.map((post) => ({
        title:post.data.title,
        description:post.data.description,
        pubDate:post.data.pubDate,
        author:authorMap.get(post.data.author.id)?.name||"未知作者",
      link: `/blog/${post.id}/`,
    })),
    })
}