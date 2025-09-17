/**
 * Service Worker
 * 提供离线功能、缓存管理和后台同步
 */

const CACHE_NAME = 'referral-jobs-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DATA_CACHE = 'data-v1.0.0';

// 需要缓存的静态资源
const STATIC_FILES = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/main.js',
    '/js/data-manager.js',
    '/js/advanced-search.js',
    '/js/data-visualization.js',
    '/manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// 需要缓存的数据文件
const DATA_FILES = [
    '/data/jobs.json',
    '/data/statistics.json'
];

// 安装事件
self.addEventListener('install', event => {
    console.log('[SW] 安装中...');
    
    event.waitUntil(
        Promise.all([
            // 缓存静态资源
            caches.open(STATIC_CACHE).then(cache => {
                console.log('[SW] 缓存静态资源');
                return cache.addAll(STATIC_FILES.map(url => new Request(url, { credentials: 'same-origin' })));
            }),
            // 缓存数据文件
            caches.open(DATA_CACHE).then(cache => {
                console.log('[SW] 缓存数据文件');
                return cache.addAll(DATA_FILES.map(url => new Request(url, { credentials: 'same-origin' })));
            })
        ]).then(() => {
            console.log('[SW] 安装完成');
            // 强制激活新的 Service Worker
            return self.skipWaiting();
        })
    );
});

// 激活事件
self.addEventListener('activate', event => {
    console.log('[SW] 激活中...');
    
    event.waitUntil(
        // 清理旧缓存
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DATA_CACHE) {
                        console.log('[SW] 删除旧缓存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] 激活完成');
            // 立即控制所有页面
            return self.clients.claim();
        })
    );
});

// 拦截请求
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);
    
    // 只处理同源请求和CDN资源
    if (requestUrl.origin === location.origin || isCDNResource(requestUrl.href)) {
        event.respondWith(handleRequest(event.request));
    }
});

// 处理请求的策略
async function handleRequest(request) {
    const url = new URL(request.url);
    
    try {
        // 对于数据文件，使用网络优先策略
        if (isDataFile(url.pathname)) {
            return await networkFirst(request);
        }
        
        // 对于静态资源，使用缓存优先策略
        if (isStaticFile(url.pathname) || isCDNResource(request.url)) {
            return await cacheFirst(request);
        }
        
        // 对于HTML页面，使用网络优先策略
        if (isHTMLRequest(request)) {
            return await networkFirst(request);
        }
        
        // 默认策略：网络优先
        return await networkFirst(request);
        
    } catch (error) {
        console.error('[SW] 请求处理失败:', error);
        
        // 如果是导航请求（页面），返回离线页面
        if (isHTMLRequest(request)) {
            return await getOfflinePage();
        }
        
        // 其他情况返回缓存或错误
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return new Response('离线状态，资源不可用', { 
            status: 503, 
            statusText: 'Service Unavailable' 
        });
    }
}

// 缓存优先策略
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // 后台更新缓存
        updateCache(request);
        return cachedResponse;
    }
    
    // 缓存未命中，从网络获取
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
        const cache = await caches.open(getCacheName(request));
        cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
}

// 网络优先策略
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse && networkResponse.status === 200) {
            // 更新缓存
            const cache = await caches.open(getCacheName(request));
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('[SW] 网络请求失败，使用缓存:', request.url);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// 后台更新缓存
async function updateCache(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(getCacheName(request));
            await cache.put(request, networkResponse);
            console.log('[SW] 后台更新缓存:', request.url);
        }
    } catch (error) {
        console.log('[SW] 后台更新失败:', request.url);
    }
}

// 获取离线页面
async function getOfflinePage() {
    const cache = await caches.open(STATIC_CACHE);
    const cachedPage = await cache.match('/');
    
    if (cachedPage) {
        return cachedPage;
    }
    
    // 返回简单的离线页面
    return new Response(`
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>离线状态 - 内推宝典</title>
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: 100vh; 
                    margin: 0; 
                    background: #f5f9fb;
                    color: #2c3e50;
                }
                .offline-container {
                    text-align: center;
                    padding: 2rem;
                    background: white;
                    border-radius: 1rem;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .offline-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }
                h1 { margin-bottom: 1rem; }
                p { margin-bottom: 1.5rem; color: #64748b; }
                button {
                    background: #a8d8ea;
                    color: #2c3e50;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    font-size: 1rem;
                }
            </style>
        </head>
        <body>
            <div class="offline-container">
                <div class="offline-icon">📱</div>
                <h1>离线状态</h1>
                <p>您当前处于离线状态，部分功能可能不可用。<br>请检查网络连接后重试。</p>
                <button onclick="window.location.reload()">重新加载</button>
            </div>
        </body>
        </html>
    `, {
        headers: { 'Content-Type': 'text/html' }
    });
}

// 辅助函数
function isDataFile(pathname) {
    return pathname.startsWith('/data/') || pathname.endsWith('.json');
}

function isStaticFile(pathname) {
    return pathname.endsWith('.css') || 
           pathname.endsWith('.js') || 
           pathname.endsWith('.png') || 
           pathname.endsWith('.jpg') || 
           pathname.endsWith('.svg') ||
           pathname.endsWith('.ico');
}

function isHTMLRequest(request) {
    return request.destination === 'document' || 
           request.headers.get('accept')?.includes('text/html');
}

function isCDNResource(url) {
    return url.includes('cdnjs.cloudflare.com') || 
           url.includes('fonts.googleapis.com') ||
           url.includes('cdn.jsdelivr.net');
}

function getCacheName(request) {
    const url = new URL(request.url);
    
    if (isDataFile(url.pathname)) {
        return DATA_CACHE;
    }
    
    return STATIC_CACHE;
}

// 后台同步
self.addEventListener('sync', event => {
    console.log('[SW] 后台同步:', event.tag);
    
    if (event.tag === 'background-sync-data') {
        event.waitUntil(syncData());
    }
});

// 同步数据
async function syncData() {
    try {
        console.log('[SW] 同步数据中...');
        
        // 更新职位数据
        const jobsResponse = await fetch('/data/jobs.json');
        if (jobsResponse.ok) {
            const cache = await caches.open(DATA_CACHE);
            await cache.put('/data/jobs.json', jobsResponse);
        }
        
        // 更新统计数据
        const statsResponse = await fetch('/data/statistics.json');
        if (statsResponse.ok) {
            const cache = await caches.open(DATA_CACHE);
            await cache.put('/data/statistics.json', statsResponse);
        }
        
        console.log('[SW] 数据同步完成');
        
        // 通知页面数据已更新
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'DATA_UPDATED',
                timestamp: Date.now()
            });
        });
        
    } catch (error) {
        console.error('[SW] 数据同步失败:', error);
    }
}

// 推送通知
self.addEventListener('push', event => {
    console.log('[SW] 收到推送:', event);
    
    const options = {
        body: '有新的内推职位更新！',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'job-update',
        data: {
            url: '/'
        },
        actions: [
            {
                action: 'view',
                title: '查看',
                icon: '/icons/view-icon.png'
            },
            {
                action: 'dismiss',
                title: '忽略',
                icon: '/icons/dismiss-icon.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('内推宝典', options)
    );
});

// 通知点击
self.addEventListener('notificationclick', event => {
    console.log('[SW] 通知点击:', event);
    
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            self.clients.openWindow(event.notification.data.url || '/')
        );
    }
});

// 消息处理
self.addEventListener('message', event => {
    console.log('[SW] 收到消息:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'REQUEST_SYNC') {
        // 请求后台同步
        event.waitUntil(syncData());
    }
});

console.log('[SW] Service Worker 已加载');
